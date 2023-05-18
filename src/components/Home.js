import Post from "./Post";
import { useEffect,useState } from "react";
import Loading from "./Loading";
import Pagination from 'react-bootstrap/Pagination';

function Home() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/posts`,{
            headers: {
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
            },
        }).then(response=>{
            response.json().then(posts=>{
                setIsLoading(false);
                setPosts(posts);
            });
        });
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(posts.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = posts.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    return (
        <>
            {isLoading ? 
                <>
                    <Loading/>
                    <div className="post-container">
                        <h1>Welcome to Mern Blog App</h1>
                        <img src="https://img.freepik.com/free-vector/hand-drawn-man-working-from-home_23-2148818123.jpg?w=740&t=st=1676899883~exp=1676900483~hmac=0e2f2096a6575ec3f955668dcc5c5ba0b542f047a5c2747ccdd81194d5bd6fdd" alt="" className="empty-home-img"/>
                        <h3 className="no-post-text">Start Creating Posts</h3>
                    </div>
                </>
                : 
                <div className="post-container">
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
                    {posts.length === 0 &&  
                        <>
                            <h1>Welcome to Mern Blog App</h1>
                            <img src="https://img.freepik.com/free-vector/hand-drawn-man-working-from-home_23-2148818123.jpg?w=740&t=st=1676899883~exp=1676900483~hmac=0e2f2096a6575ec3f955668dcc5c5ba0b542f047a5c2747ccdd81194d5bd6fdd" alt="" className="empty-home-img"/>
                            <h3 className="no-post-text">Start Creating Posts</h3>
                        </>
                    }
                </div>
            }
        </>
    );
}

export default Home;
