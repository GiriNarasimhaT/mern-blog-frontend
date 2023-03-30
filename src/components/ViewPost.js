import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { format } from "date-fns";
import { UserContext } from "../UserContext";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Loading from "./Loading";
import PageNotFound from './PageNotFound';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewPost() {
    const [isLoading, setIsLoading] = useState(true);
    const [postdata, setPostdata] = useState(null);
    const { userInfo } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [type, setType] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const commentRef = useRef(null);

    useEffect(() => {
        if (message) {
            if (type)
                toast.success(message);
            else {
                toast.error(message);
            }
            setMessage('');
        }
    }, [message]);

    const { id } = useParams();
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}`).then(response => {
            response.json().then(postdata => {
                setIsLoading(false);
                setPostdata(postdata);
                setLikeCount(postdata.likecount);
                setComments(postdata.comments);
            });
        });
    }, [id]);

    // Delete post
    async function deletePost(e) {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.set('id', id);

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete`, {
            method: 'DELETE',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            setIsLoading(false);
            setRedirect(true);
            setMessage("Post Deleted Successfully");
            setType(true);
        }
        else {
            setIsLoading(false);
            setMessage("Post Delete Failed");
            setType(false);
        }
    }

    const [viewed, setViewed] = useState(false);
    useEffect(() => {
      const viewedIds = localStorage.getItem('viewedIds') ? localStorage.getItem('viewedIds').split(',') : [];
      if (!viewedIds.includes(id)) {
        setViewed(true);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}/viewcount`, {
          method: 'PUT',
          credentials: 'include',
        });
        localStorage.setItem('viewedIds', [...viewedIds, id].join(','));
      }
    }, [id]);
    
    const likedIds = localStorage.getItem('likedIds') ? localStorage.getItem('likedIds').split(',') : [];
    const [liked, setLiked] = useState(likedIds.includes(id));
    const toggleLike =async () => {
        if (!liked) {
            setLiked(true);
            setLikeCount(likeCount + 1);
            fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}/likecount`, {
                method: 'PUT',
                credentials: 'include',
            });
            localStorage.setItem('likedIds', [...likedIds, id].join(','));
        } else {
            setLiked(false);
            setLikeCount(likeCount - 1);
            fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}/unlikecount`, {
                method: 'PUT',
                credentials: 'include',
            });
            localStorage.setItem('likedIds', likedIds.filter((postId) => postId !== id).join(','));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/post/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })
            .then(response => {
                response.json().then(post => {
                    setText('');
                    setComments(post.comments);
                    setMessage("Comment added Successfully");
                    setType(true);
            })});

            if (!res.ok) {
                setMessage("Failed to add comment");
                setType(false);
            }

            const data = await res.json();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToComment = () => {
        commentRef.current.scrollIntoView({ behavior: "smooth" });
        commentRef.current.focus();
    };

    if (redirect) {
        return <Navigate to={'/'} />
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!postdata.title) return (<PageNotFound />);

    return (
                <div className="viewpost">
                    <h1>{postdata.title}</h1>
                    <div className="author-row">{
                        <Link to={`/viewprofile/${postdata.author?._id ?? ''}`} className="author">
                            @{postdata.author?.username ?? 'Unknown'}
                        </Link>
                    } | <time>Last modified : {format(new Date(postdata.updatedAt), 'MMM d, yyyy')}</time>
                    | <time>Published : {format(new Date(postdata.createdAt), 'MMM d, yyyy')}</time> 
                    | <span className="view-count"> Views : {postdata.viewcount}</span>
                    </div>
                    {userInfo?.id===postdata.author?._id && postdata.author?._id && (
                        <div className="edit-row">
                            <Link className="edit-btn links" to={`/edit/${postdata._id}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                                Edit Post
                            </Link>
                            <Popup trigger={
                                    <button className="delete-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                        Delete Post
                                    </button>
                                }
                                modal={true}
                                closeOnDocumentClick
                                className="popup-card"
                            >
                                <div className="popup-items">
                                    <h3>Are you sure, you want to delete?</h3>
                                    <button style={{marginTop:'10px'}} onClick={deletePost}>Delete</button>
                                </div>
                            </Popup>
                        </div>
                    )}
                    <div className="postcover">
                        <img 
                            src={`${process.env.REACT_APP_BACKEND_URL}/${postdata.cover}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${process.env.PUBLIC_URL}/assets/imagenotfound.png`
                            }}
                            alt="" />
                    </div>
                    {/* <h5>{postdata.summary}</h5> */}
                    <div className="content" dangerouslySetInnerHTML={{__html:postdata.content}}/>

                    <form onSubmit={handleSubmit} className="comment-sec">
                        <br/><h3>Comments</h3><br/>
                        <textarea type="text" placeholder="Write a comment" value={text} onChange={(e)=>setText(e.target.value)} ref={commentRef} required/><br/>
                        <button type="submit" className='comment-btn'>Add Comment</button><br/>
                    </form>

                    <div>
                        {comments.map(comment => (
                        <div className="comments" key={comment._id}>
                            <p className="comment">{comment.text}</p>
                            <p className="comment-time">{new Date(comment.created).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</p>
                        </div>
                        ))}
                    </div>
                    <br/>

                    <span className="action-btns-overlay">
                        <span className="action-btns-container">
                            <span className="rbtn">
                                <input type="checkbox" id="favorite" name="favorite-checkbox" value="favorite-button" checked={liked}/>
                                <label htmlFor="favorite" className="container" onClick={toggleLike}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    <span>{likeCount}</span>
                                </label>
                            </span>
                            <span className="action-btn-sep"></span>
                            <span className="rbtn" onClick={() => scrollToComment()}>
                                <svg width="20px" height="20px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11233)"> <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" stroke="#ffffff" stroke-width="1.464" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_429_11233"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>
                                <span> {comments.length}</span>
                            </span>
                        </span>
                    </span>
                </div>
            );
}

export default ViewPost;