### Backend API ENDPOINTS Documentation
<br/>
AUTHENTICATION

Login

> POST /login [email, password]
> 

payload: { email: “string”, password: “string” }

Registration

> POST /signup [email, password]
> 

payload: { email: “string”, password: “string” }

<br/>
DECKS

Get Single Deck 

> GET /deck/{id}
> 

Get ALL Decks 

> GET /deck/all
> 

Create Deck 

> POST /deck/create
> 

payload: { localId: “string”, title: “string”, description: “string”, visibility: “string” }
visibility (public/private)

Update Single Deck

> PATCH /deck/{id}
> 

payload: { localId: “string”, title: “string”, description: “string”, visibility: “string” }

Invite Another User to a Private Deck
> POST /deck/invite/{id}
> 
payload: { email: "string" }

Add a Public Deck to My Collection
> POST /deck/{id}/add-to-my-collection
>

Save Study Progress of a Deck 
> POST /deck/progress/{id}
> 
payload: { userId: "string", currentIndex: number }


Get Study Progress of a Deck 
> GET /deck/progress/{id}
>


Delete Single Deck

> DELETE /deck/{id}
> 
<br/>
CARDS

Get All Cards in a Deck

> GET /deck/{deckId}/card/all
> 

Create a Card in a Deck

> POST /deck/{deck_id}/card/create
> 

payload: { localId: “string”, cards: [{front: “string”, back: “string”, hint: “string”}] }

Update Single Card in a Deck

> PATCH /deck/{deck_id}/update/{id}
> 

payload: { localId: “string”, cards: [{front: “string”, back: “string”, hint: “string”}] }

Delete Single Card in a Deck

> DELETE /deck/{deck_id}/delete/{id}
>
