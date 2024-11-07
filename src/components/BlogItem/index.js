import { Link } from 'react-router-dom'

import './index.css'
import { MdDelete } from "react-icons/md";

const BlogItem = props => {
  const { blogData, deleteBlogItem} = props
  const { id, imageUrl, topic, title, avatarUrl, author, date } = blogData
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const year = dateObj.getFullYear();

  let formattedDate =  `${day} ${month} ${year}`;


  const onDelete = ()=>{
    deleteBlogItem(id);
  }

  return (
    <div className='item'>
    <Link to={`/blogs/${id}`} className="blog-item-link">
      <div className="item-container">
        <img className="item-image" src={imageUrl} alt={`item${id}`} />
        <div className="item-info">
          <p className="item-topic">{topic}</p>
          <p className="item-title">{title}</p>
          <div className="author-info">
            <img className="avatar" src={avatarUrl} alt={`avatar${id}`} />
            <p className="author-name">{author}</p>
          </div>
          <p className="item-title">{formattedDate}</p>
        </div>
      </div>
    </Link>
    <button onClick={onDelete} className='delete-button'>
    <MdDelete className='delete-icon'/>
    </button>
    
    </div>
  )
}

export default BlogItem