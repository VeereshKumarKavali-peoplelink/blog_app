import React, { useState, useEffect } from 'react'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import './index.css'

import Header from '../Header'
import Cookies from 'js-cookie'
import config from '../../config'

const BlogItemDetails = ({ match }) => {
  const [blogData, setBlogData] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getBlogItemData = async () => {
      const { id } = match.params

      const jwtToken = Cookies.get('jwt_token')
      const url = `${config.API_BASE_URL}/posts/${id}`
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }

      try {
        const response = await fetch(url, options)
        const data = await response.json()

        const updatedData = {
          title: data.title,
          imageUrl: data.image_url,
          content: data.content,
          avatarUrl: data.avatar_url,
          author: data.author,
        }
        setBlogData(updatedData)
      } catch (error) {
        console.error("Error fetching blog data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getBlogItemData()
  }, [match.params])

  const renderBlogItemDetails = () => {
    const { title, imageUrl, content, avatarUrl, author } = blogData

    return (
      <div className="blog-info">
        <h2 className="blog-details-title">{title}</h2>
        <div className="author-details">
          <img className="author-pic" src={avatarUrl} alt={author} />
          <p className="details-author-name">{author}</p>
        </div>
        <img className="blog-image" src={imageUrl} alt={title} />
        <p className="blog-content">{content}</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="blog-container">
        {isLoading ? (
          <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
        ) : (
          renderBlogItemDetails()
        )}
      </div>
    </>
  )
}

export default BlogItemDetails
