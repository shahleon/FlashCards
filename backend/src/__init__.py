import pyrebase

config = {
  'apiKey': "AIzaSyCgwTq8vIGl5spCZFUxj_8AeBRBn4TEPeE",
  'authDomain': "cs510-flash-cards.firebaseapp.com",
  'databaseURL': "https://cs510-flash-cards-default-rtdb.firebaseio.com/",
  'projectId': "cs510-flash-cards",
  'storageBucket': "cs510-flash-cards.appspot.com",
  'messagingSenderId': "180819539604",
  'appId': "1:180819539604:web:a57ae8b5f3db217768a681",
  'measurementId': "G-L87JWQQREY"
}

firebase = pyrebase.initialize_app(config)