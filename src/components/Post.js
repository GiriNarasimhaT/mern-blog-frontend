import {format} from 'date-fns';
import { Link } from 'react-router-dom';

function Post(props) {
    return (
        <Link to={`/post/${props._id}`} className="links">
            <div className="post">
                <div className="image">
                    <img
                        src={`${process.env.REACT_APP_BACKEND_URL}/${props.cover}`}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/138/138574.png?w=740&t=st=1678194762~exp=1678195362~hmac=a2231c9bfaae4dd146f7f7605de909bc3338d65a54b776091625d7ccc04d30a6';
                        }}
                        alt=""
                    />
                </div>
                <div className="texts">
                    <h2>{props.title}</h2>
                    <p className="info">
                        <Link to={`/viewprofile/${props.author?._id ?? ''}`} className="author links">@{props.author?.username ?? 'Unknown'}</Link>
                        <time>{format(new Date(props.createdAt),'MMM d, yyyy | HH:mm')}</time>
                    </p>
                    <p className="summary">{props.summary}</p>
                </div>
            </div>
        </Link>
     );
}

export default Post;