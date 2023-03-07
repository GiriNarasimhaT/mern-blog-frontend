import {Link} from "react-router-dom"
import { UserContext } from "../UserContext";
import { useEffect,useContext,useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Header() {
    const {userInfo,setUserInfo} = useContext(UserContext);
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/profile`,{
            credentials:'include',
        }).then(response=>{
            response.json().then(userInfo=>{
                setUserInfo(userInfo);
            });
        });
    }, []);

    function logout() {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`,{
            credentials:'include',
            method:'POST',
        });
        setUserInfo(null);
        setMessage("You are now Logged out");
    }

    useEffect(() => {
        if (message){
            toast.info(message);
            setMessage('');
        }
    }, [message]);
    
    const {id, email} = userInfo || {};

    return (
        <Navbar collapseOnSelect expand="lg" bg="light">
        <Container>
        <Navbar.Brand as={Link} to="/" className="links"><img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="logo"/> Mern Blog App</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto"></Nav>
            <Nav className="nav">
            {email && (
                <>
                    <Nav.Link as={Link} to="/newpost" className="links">New Post</Nav.Link>
                    <NavDropdown title={<>
                            {userInfo.profilePicture ? (
                                <img 
                                    src={`${process.env.REACT_APP_BACKEND_URL}/${userInfo.profilePicture}`} 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://cdn-icons-png.flaticon.com/512/138/138574.png?w=740&t=st=1678194762~exp=1678195362~hmac=a2231c9bfaae4dd146f7f7605de909bc3338d65a54b776091625d7ccc04d30a6';
                                    }}
                                    alt="" className="header-img"
                                />
                            ) : (
                                <svg className="header-img w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            {" "+userInfo.username}</>
                        }
                        id="basic-nav-dropdown">
                        <NavDropdown.Item>
                            <Nav.Link as={Link} to={`/viewprofile/${id}`} className="links">Profile</Nav.Link>
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item>
                            <Nav.Link onClick={() => logout()}>Logout</Nav.Link>
                        </NavDropdown.Item>
                    </NavDropdown>
                </>
            )}
            {!email && (
                <>
                    <Nav.Link as={Link} to="/login" className="links">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register" className="links">Register</Nav.Link>
                </>
            )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}

export default Header;