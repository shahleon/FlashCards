#MIT License
#
#Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in all
#copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#SOFTWARE.

'''routes.py is a file in deck folder that has all the functions defined that manipulate the deck. All CRUD functions are defined here.'''
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
try:
    from .. import firebase
except ImportError:
    from __init__ import firebase


deck_bp = Blueprint(
    'deck_bp', __name__
)

db = firebase.database()


@deck_bp.route('/deck/<id>', methods = ['GET'])
@cross_origin(supports_credentials=True)
def getdeck(id):
    '''This method is called when we want to fetch one of the decks, we pass deckid of this deck'''
    try:
        deck = db.child("deck").child(id).get()
        return jsonify(
            deck = deck.val(),
            message = 'Fetched deck successfully',
            status = 200
        ), 200
    except Exception as e:
        return jsonify(
            decks = [],
            message = f"An error occurred: {e}",
            status = 400
        ), 400


@deck_bp.route('/deck/all', methods = ['GET'])
@cross_origin(supports_credentials=True)
def getdecks():
    '''This method is called when we want to fetch all of the decks. Here, we check if the user is authenticated, 
    if yes show all the decks made by the user including the ones with private vissibility. if the user is not 
    authenticated then only show decks that have public vissibility.'''
    args = request.args
    localId = args and args['localId']
    try:
        if localId:
            user_decks = db.child("deck").order_by_child("userId").equal_to(localId).get()
            decks = []
            for deck in user_decks.each():
                obj = deck.val()
                obj['id'] = deck.key()
                obj['is_owner'] = True
                deck_progress = get_deck_progress(deck.key(), localId)
                obj['progress'] = 0
                if deck_progress is not None:
                    obj['progress'] = int(100*(int(deck_progress['currentIndex']) + 1)/int(obj['cards_count']))
                if "tags" not in obj:
                    obj["tags"] = []

                decks.append(obj)

            shared_decks = db.child("deck_invitees").order_by_child("userId").equal_to(localId).get()
            for shared_deck in shared_decks.each():
                shared_deck = shared_deck.val()
                deck = db.child("deck").child(shared_deck["deckId"]).get()
                deck_id = deck.key()
                deck = deck.val()
                deck['id'] = deck_id
                deck['is_owner'] = False
                deck_progress = get_deck_progress(deck.key(), localId)
                deck['progress'] = 0
                if deck_progress is not None:
                    deck['progress'] = int(100*int(deck_progress['currentIndex'])/int(deck['cards_count']))
                if "tags" not in deck:
                    deck["tags"] = []
                decks.append(deck)

            return jsonify(
                decks = decks,
                message = 'Fetching decks successfully',
                status = 200
            ), 200
        else:
            alldecks = db.child("deck").order_by_child("visibility").equal_to("public").get()
            d = alldecks.val()
            decks = []
            for deck in alldecks.each():
                obj = deck.val()
                obj['id'] = deck.key()
                obj['is_owner'] = False
                if "tags" not in obj:
                    obj["tags"] = []
                decks.append(obj)
                
            return jsonify(
                decks = decks,
                message = 'Fetching decks successfully',
                status = 200
            ), 200
    except Exception as e:
        return jsonify(
            decks = [],
            message = f"An error occurred {e}",
            status = 400
        ), 400


@deck_bp.route('/deck/create', methods = ['POST'])
@cross_origin(supports_credentials=True)
def create():
    '''This method is routed when the user requests to create a new deck. To create a new deck, userID, title, description and vissibility are the input required.'''
    try:
        data = request.get_json()
        localId = data['localId']
        title = data['title']
        description = data['description']
        visibility = data['visibility']
        tags = data['tags']
        
        db.child("deck").push({
            "userId": localId, "title": title, "description": description, "visibility": visibility, "cards_count": 0, "tags": tags
        })

        # for tag in tags:
        #     db.child("deck").child("tags").push({
        #        "title": tag
        #     })
        
        return jsonify(
            message = 'Create Deck Successful',
            status = 201
        ), 201
    except Exception as e:
        return jsonify(
            message = f'Create Deck Failed {e}',
            status = 400
        ), 400


@deck_bp.route('/deck/invite/<id>', methods = ['POST'])
@cross_origin(supports_credentials=True)
def invite(id):
    '''This method is called when we want to invite another user to a private Deck. The existence of the invited user is
    checked in the database and if present access is given to the invited user to the private Deck'''
    try:
        data = request.get_json()
        invitee = data['email']
        users = db.child("users").order_by_child("email").equal_to(invitee).limit_to_first(1).get()
        for user in users:
            if user is None:
                raise Exception
            user = user.val()
            user_id = user["userId"]
            user_decks = db.child("deck_invitees")\
                .order_by_child("deckId").equal_to(id)\
                .order_by_child("userId").equal_to(user_id)\
                .limit_to_first(1).get()
            if user_decks.val() is not None:
                for user_deck in user_decks.each():
                    user_deck = user_deck.val()
                    if user_deck["deckId"] == id and user_deck["userId"] == user_id:
                        return jsonify(), 201
            db.child("deck_invitees").push({
                "deckId": id,
                "userId": user_id
            })

        return jsonify(), 201
    except Exception as e:
        return jsonify(
            message=f'Inviting friend failed {e}',
            status=400
        ), 400


@deck_bp.route('/deck/<deck_id>/add-to-my-collection', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_deck_to_collection(deck_id):
    '''This method is used to add a Public Deck created by some other user to our own Collection for easy access. A new
    copy of the public Deck is created with all the cards and visibility is set to Private, so the user is free to make
    any changes necessary.'''
    try:
        data = request.get_json()
        localId = data['localId']
        deck = db.child("deck").child(deck_id).get()
        if deck:
            deck_val = deck.val()
            new_deck = db.child("deck").push({
                "userId": localId, "title": deck_val.get("title", "deck title"),
                "description": deck_val.get("description", "description"),
                "visibility": "private",
                "cards_count": deck_val.get("cards_count", 0),
                "tags": deck_val.get("tags", {})
            })
            deck_cards = db.child("card").order_by_child("deckId").equal_to(deck_id).get()
            cards = [card.val() for card in deck_cards.each()]
            for card in cards:
                db.child("card").push({
                    "userId": localId,
                    "deckId": new_deck['name'],
                    "front": card['front'],
                    "back": card['back'],
                    "hint": card['hint']
                })

        return jsonify(), 201

    except Exception as e:
        return jsonify(
            message=f'Adding to collection failed {e}',
            status=400
        ), 400


@deck_bp.route('/deck/progress/<deck_id>', methods=['POST'])
@cross_origin(supports_credentials=True)
def save_progress(deck_id):
    '''This method is used to save the study progress for a Deck for the currently logged in user. The user will be able
    to check his progress for any particular Deck from the Dashboard page for a quick overview of their progress'''
    try:
        data = request.get_json()
        user_id = data['userId']
        current_index = data['currentIndex']
        deck_progress = get_deck_progress(deck_id, user_id)
        if deck_progress is not None:
            db.child("deck_progress").child(deck_progress["id"]).remove()

        db.child("deck_progress").push({
            "deckId": deck_id,
            "userId": user_id,
            "currentIndex": current_index
        })

        return jsonify(), 201
    except Exception as e:
        return jsonify(
            message=f'Inviting friend failed {e}',
            status=400
        ), 400


@deck_bp.route('/deck/progress/<deck_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_progress(deck_id):
    '''This method is used to get the study progress for a Deck for the currently logged in user. The user will be able
    to check his progress for any particular Deck from the Dashboard page for a quick overview of their progress'''
    args = request.args
    user_id = args and args['localId']
    try:
        deck_progress = get_deck_progress(deck_id, user_id)
        return jsonify(
            deckProgress=deck_progress,
            message='Fetched Deck Progress Successfully',
            status=200
        ), 200
    except Exception as e:
        return jsonify(
            message=f'Failed to Get Deck Study Progress {e}',
            status=400
        ), 400


def get_deck_progress(deck_id, user_id):
    try:
        deck_progress_list = db.child("deck_progress")\
            .order_by_child("deckId").equal_to(deck_id).get()

        deck_progress = None
        for deck_progress in deck_progress_list.each():
            current_progress = deck_progress.val()
            if current_progress["userId"] == user_id:
                key = deck_progress.key()
                deck_progress = current_progress
                deck_progress["id"] = key
                break

        return deck_progress
    except Exception as e:
        raise e


@deck_bp.route('/deck/update/<id>', methods = ['PATCH'])
@cross_origin(supports_credentials=True)
def update(id):
    '''This method is called when the user requests to update the deck. The deck can be updated in terms of its title, description and vissibility.'''
    try:
        data = request.get_json()
        localId = data['localId']
        title = data['title']
        description = data['description']
        visibility = data['visibility']
        tags = data['tags']

        db.child("deck").child(id).update({
            "userId": localId, "title": title, "description": description, "visibility" : visibility, "tags": tags
        })

        return jsonify(
            message = 'Update Deck Successful',
            status = 201
        ), 201
    except Exception as e:
        return jsonify(
            message = f'Update Deck Failed {e}',
            status = 400
        ), 400
 

@deck_bp.route('/deck/delete/<id>', methods = ['DELETE'])
@cross_origin(supports_credentials=True)
def delete(id):
    '''This method is called when the user requests to delete the deck. Only the deckid is required to delete the deck.'''
    try:
        db.child("deck").child(id).remove()
        
        return jsonify(
            message = 'Delete Deck Successful',
            status = 200
        ), 200
    except Exception as e:
        return jsonify(
            message = f'Delete Deck Failed {e}',
            status = 400
        ), 400
