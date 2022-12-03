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

'''import dependancies'''
import datetime
from datetime import date

from flask import Blueprint, jsonify
from flask import current_app as app
from flask_cors import cross_origin
from flask import request
try:
    from .. import firebase
except ImportError:
    from __init__ import firebase

auth_bp = Blueprint(
    'auth_bp', __name__
)

auth = firebase.auth()
db = firebase.database()

@auth_bp.route('/', methods=['GET'])
@cross_origin(supports_credentials=True)
def index():
    return "Hello"

@auth_bp.route('/signup', methods=['POST'])
@cross_origin(supports_credentials=True)
def signup():                                       
    '''this method is used to create new users and register them in firebase'''
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
    
        user = auth.create_user_with_email_and_password(email, password)
        db.child("users").push({
            "userId": user["localId"], "email": email
        })
        '''if the registration process is successful, this message is displayed'''
        return jsonify(
            user = user,                            
            message = 'Registered Successfully',    
            status = 201
        ), 201
    except:
        '''if the registration process is not successful, this message is displayed'''
        return jsonify(
            message = 'Registration Failed',        
            status = 400
        ), 400

@auth_bp.route('/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login():
    '''this method is used by registered users to sign in to their account'''
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']                   
        
        user = auth.sign_in_with_email_and_password(email, password)

        user_id = user["localId"]
        user_daily_streaks = db.child("user_daily_streaks") \
            .order_by_child("userId").equal_to(user_id).get()

        daily_streak = None
        for daily_streak in user_daily_streaks.each():
            current_progress = daily_streak.val()
            if current_progress["userId"] == user_id:
                key = daily_streak.key()
                daily_streak = current_progress
                daily_streak["id"] = key
                break

        current_streak_count = 1
        yesterday = date.today() - datetime.timedelta(days=1)
        if daily_streak and daily_streak["lastLoginDate"] == yesterday.strftime('%Y-%m-%d'):
            print("2")
            current_streak_count = daily_streak["currentStreakCount"] + 1

        elif daily_streak and daily_streak["lastLoginDate"] == date.today().strftime('%Y-%m-%d'):
            print("3")
            current_streak_count = daily_streak["currentStreakCount"]

        if daily_streak:
            db.child("user_daily_streaks").child(daily_streak["id"]).remove()

        db.child("user_daily_streaks").push({
            "userId": user_id, "lastLoginDate": date.today().strftime('%Y-%m-%d'),
            "currentStreakCount": current_streak_count
        })

        '''if login is successful, this message is displayed'''
        '''daily_streak = current_streak_count,'''
        return jsonify(
            user = user,
            daily_streak = current_streak_count,
            message = 'Login Successful',           
            status = 200
        ), 200
    except Exception as e:
        '''if login is not successful, this message is displayed'''
        return jsonify(
            message = f"An error occurred {e}",
            status = 400
        ), 400

if __name__ == '__main__':
    app.debug = True
    app.run()
