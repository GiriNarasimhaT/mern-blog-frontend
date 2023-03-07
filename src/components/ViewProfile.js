import { Link, useParams,Navigate } from "react-router-dom";
import { useEffect,useState,useContext } from "react";
import { UserContext } from "../UserContext";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Loading from "./Loading";
import PageNotFound from './PageNotFound';
import Post from "./Post";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from 'react-bootstrap/Pagination';

function ViewProfile() {
    const [isLoading, setIsLoading] = useState(true);
    const [userdata, setUserdata] = useState(null);
    const [posts, setPosts] = useState([]);

    const [message, setMessage] = useState('');
    const [type, setType] = useState(false);

    useEffect(() => {
        if (message){
            if (type)
            toast.success(message);
            else{
            toast.error(message);
            }
            setMessage('');
        }
    }, [message]);
    
    const {id} = useParams();
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Invalid User Id');
            }
            return response.json();
          })
          .then(data => {
            setIsLoading(false);
            setUserdata(data.user);
            setPosts(data.posts);
          })
          .catch(error => {
            console.error(error);
            setIsLoading(false);
            setRedirect(true);
            setMessage("Invalid User Id");
            setType(false);
          });
      }, []);

    // Delete user
    const [redirect, setRedirect] = useState(false);
    const {userInfo,setUserInfo} = useContext(UserContext);
    async function deleteuser(e){
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.set('id',id);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/deleteuser`,{
            method:'DELETE',
            body: data,
            credentials: 'include',
        });

        if (response.ok){
            fetch(`${process.env.REACT_APP_BACKEND_URL}/logout`,{
                credentials:'include',
                method:'POST',
            });
            setIsLoading(false);
            setUserInfo(null);
            setUserdata(null);
            setRedirect(true);
            setMessage("Account Deleted Successfully");
            setType(true);
        }
        else{
            setIsLoading(false);
            setMessage("Account Deletetion Failed");
            setType(false);
        }
    }

    // Delete all posts
    async function deleteposts(e){
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.set('id',id);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/deleteposts`,{
            method:'DELETE',
            body: data,
            credentials: 'include',
        });
        if (response.ok){
            setIsLoading(false);
            setPosts([]);
            setUserdata(prevState => ({ ...prevState, postcount: 0 }));
            setMessage("Posts Deleted Successfully");
            setType(true);
        }
        else{
            setIsLoading(false);
            setMessage("Posts Deletetion Failed");
            setType(false);
        }
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(posts.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = posts.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (redirect){
        return <Navigate to={'/'}/> //reloads component
        // window.location.href = "/"; //reloads page
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!userdata.email) return (<PageNotFound/>);

    return (
                <div className="viewprofile">
                    <div className="userpic">
                        {userdata.profilePicture ? (
                            <img 
                                src={`${process.env.REACT_APP_BACKEND_URL}/${userdata.profilePicture}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/138/138574.png?w=740&t=st=1678194762~exp=1678195362~hmac=a2231c9bfaae4dd146f7f7605de909bc3338d65a54b776091625d7ccc04d30a6';
                                }}
                                alt=""
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                    <div className="profile-data">
                        <h4>{userdata.username}</h4>
                        <p>{userdata.bio}</p>
                        <h4>{userdata.email}</h4>
                        <p>Total Posts : {userdata.postcount}</p>

                        {userInfo?.id===userdata._id && (
                            <div className="profile-btns">
                                <Link className="edit-btn links" to={`/editprofile/${userdata._id}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                    Edit Profile
                                </Link>
                                <Popup trigger={
                                        <button className="delete-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    }
                                    modal={true}
                                    closeOnDocumentClick
                                    className="popup-card"
                                >
                                    <div className="popup-items">
                                        <h3>Are you sure, you want to delete?</h3>
                                        <button style={{marginTop:'10px'}} onClick={deleteuser}>Delete</button>
                                    </div>
                                </Popup>
                                <Popup trigger={
                                        <button className="delete-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            Delete All Posts
                                        </button>
                                    }
                                    modal={true}
                                    closeOnDocumentClick
                                    className="popup-card"
                                >
                                    <div className="popup-items">
                                        <h3>Are you sure, you want to delete?</h3>
                                        <button style={{marginTop:'10px'}} onClick={deleteposts}>Delete</button>
                                    </div>
                                </Popup>
                            </div>
                        )}

                        <div className="post-container author-page">
                            {posts.length > 0 &&  currentItems.map(post =>(
                                <Post key={post._id} {...post}/>
                            ))}
                            {posts.length > 3 && (
                                <div className="pagination-div">
                                    <Pagination>
                                        <Pagination.First onClick={() => paginate(1)}/>
                                        <Pagination.Prev disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)}/>
                                        {Array.from({ length: Math.ceil(posts.length / itemsPerPage) }, (_, i) => (
                                            <Pagination.Item active={currentPage === i + 1} key={i + 1} onClick={() => paginate(i + 1)}>{i + 1}</Pagination.Item>
                                        ))}
                                        <Pagination.Next disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} />
                                        <Pagination.Last onClick={() => paginate(Math.ceil(posts.length / itemsPerPage))}/>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
}

export default ViewProfile;