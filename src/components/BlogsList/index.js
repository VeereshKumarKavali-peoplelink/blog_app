import { Component } from 'react';
import Loader from 'react-loader-spinner';
import Cookies from 'js-cookie';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import BlogItem from '../BlogItem';
import config from '../../config';
import Header from '../Header';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import { MdEdit } from 'react-icons/md';

import './index.css';
Modal.setAppElement('#root');

class BlogsList extends Component {
  state = { 
    isLoading: true, 
    blogsData: [],  
    isModalOpen: false,   
    formData: {
      title: '',
      topic: '',
      content: ''
    },
    editBlogId: null,
    currentPage: 1,       // Track the current page
    blogsPerPage: 5,      // Set the number of blogs per page
    totalPages: 0         // Track total pages available
  };

  componentDidMount() {
    this.getBlogsData();
  }

  getBlogsData = async () => {
    const { currentPage, blogsPerPage } = this.state;
    const jwtToken = Cookies.get('jwt_token');
    const url = `${config.API_BASE_URL}/posts?page=${currentPage}&limit=${blogsPerPage}`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwtToken}`
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    const formattedData = data.posts.map(eachItem => ({
      id: eachItem._id,
      title: eachItem.title,
      imageUrl: eachItem.image_url,
      avatarUrl: eachItem.avatar_url,
      author: eachItem.author,
      topic: eachItem.topic,
      content: eachItem.content,
      date: eachItem.createdAt
    }));

    this.setState({ 
      blogsData: formattedData, 
      isLoading: false,
      totalPages: data.pageInfo.totalPages // Set the total number of pages
    });
  };

  deleteBlogItem = async (id) => {
    const jwtToken = Cookies.get('jwt_token');
    const userId = JSON.parse(localStorage.getItem("userId"));
    const url = `${config.API_BASE_URL}/posts/${id}?userId=${userId}`;
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwtToken}`
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.status === 200) {
      toast.success(`${data.msg}`, { position: toast.POSITION.TOP_RIGHT, autoClose: 3000 });
      
      // Refresh the blogs after deletion
      this.setState(
        prevState => ({
          blogsData: prevState.blogsData.filter(blog => blog.id !== id),
          isLoading: true
        }),
        () => {
          const { blogsData, currentPage, blogsPerPage } = this.state;
          const remainingItemsOnPage = blogsData.length;
          
          // Adjust the page if current page is empty after deletion
          if (remainingItemsOnPage === 0 && currentPage > 1) {
            this.setState({ currentPage: currentPage - 1 }, this.getBlogsData);
          } else {
            this.getBlogsData();
          }
        }
      );
    } else {
      toast.error(`${data.err_msg}`, { position: toast.POSITION.TOP_RIGHT, autoClose: 3000 });
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page, isLoading: true }, this.getBlogsData);
  };

  renderPaginationControls = () => {
    const { currentPage, totalPages } = this.state;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => this.handlePageChange(i)}
          className={i === currentPage ? 'active-page' : ''}
        >
          {i}
        </button>
      );
    }

    return <div className="pagination-controls">{pages}</div>;
  };



  handleChange = (e) => {
    const { name, value } = e.target
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }))
  }

  // Method to open the modal for adding or editing a blog
  openModal = (id = null) => {
    if (id) {
      const blogToEdit = this.state.blogsData.find(blog => blog.id === id)
      this.setState({
        formData: {
          title: blogToEdit.title,
          topic: blogToEdit.topic,
          content: blogToEdit.content
        },
        editBlogId: id
      })
    } else {
      this.setState({
        formData: {
          title: '',
          topic: '',
          content: ''
        },
        editBlogId: null
      })
    }
    this.setState({ isModalOpen: true })
  }

  // Method to close the modal
  closeModal = () => {
    this.setState({ isModalOpen: false })
  }

  // Submit the form and make the API call
  handleSubmit = async (e) => {
    e.preventDefault()
    const { formData, editBlogId } = this.state

    // Validate that all fields are filled
    if (!formData.title || !formData.topic || !formData.content) {
      toast.error('All fields must be filled')
      return
    }

    const jwtToken = Cookies.get('jwt_token')
    const url = editBlogId
      ? `${config.API_BASE_URL}/posts/${editBlogId}`
      : `${config.API_BASE_URL}/posts`

      formData.authorId = JSON.parse(localStorage.getItem("userId"));
      formData.author = JSON.parse(localStorage.getItem("userName"));
      console.log(formData);

    const method = editBlogId ? 'PUT' : 'POST'
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwtToken}`
      },
      body: JSON.stringify(formData)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.status === 200) {
      toast.success(`${data.result}`, { position: toast.POSITION.TOP_RIGHT, autoClose: 3000 })
      this.getBlogsData()
      this.closeModal() // Close the modal after submitting
    } else {
      toast.error(`${data.err_msg}`, { position: toast.POSITION.TOP_RIGHT, autoClose: 3000 })
      this.closeModal() 
    }
  }




  render() {
    const { blogsData, isLoading, isModalOpen, formData } = this.state;
    return (
      <>
        <Header />
        <div className="blog-list-container">
          {isLoading ? (
            <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
          ) : (
            <>
              <button className="add-blog" onClick={() => this.openModal()}>Add Blog</button>
              {blogsData.map(item => (
                <div className="blog-item-container" key={item.id}>
                  <BlogItem blogData={item} deleteBlogItem={this.deleteBlogItem} />
                  <button className='edit-button' onClick={() => this.openModal(item.id)}>
                    <MdEdit className="edit-icon"/>
                  </button>
                </div>
              ))}
              {this.renderPaginationControls()}
            </>
          )}
        </div>

        {/* Modal for form */}
        <Modal isOpen={isModalOpen} onRequestClose={this.closeModal} contentLabel="Blog Form">
          <h2>{this.state.editBlogId ? 'Edit Blog' : 'Add Blog'}</h2>
          <form onSubmit={this.handleSubmit}>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={this.handleChange}
              />
            </label>
            <label>
              Topic:
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={this.handleChange}
              />
            </label>
            <label>
              Content:
              <textarea
                name="content"
                value={formData.content}
                onChange={this.handleChange}
              />
            </label>
            <button type="submit">Submit</button>
            <button type="button" onClick={this.closeModal}>Close</button>
          </form>
        </Modal>
      </>
    );
  }
}

export default BlogsList;
