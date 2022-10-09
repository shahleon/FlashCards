import sys
sys.path.append('backend/src')
import unittest
from api import create_app

class TestApp(unittest.TestCase):
    def setUp(self):
        self.app=create_app().test_client()

    def test_index_get_route(self):
        '''Test the index route of our app'''
        response=self.app.get('/')
        assert response.status_code==200
    

    def test_index_post(self):
        '''Test that the post request to the index route is not allowed'''
        response=self.app.post('/')
        assert response.status_code==405

    def test_signup_route(self):
        '''Test the signup route of our app'''
        response=self.app.post('/signup')
        assert response.status_code==200
        
    def test_login_route(self):
        '''Test the login route of our app'''
        response=self.app.post('/login')
        assert response.status_code==200
   

if __name__=="__main__":
    unittest.main()