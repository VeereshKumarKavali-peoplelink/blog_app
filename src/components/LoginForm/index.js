import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import './index.css'
import config from '../../config'

const LoginForm = () => {
  const [showSubmitError, setShowSubmitError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const history = useHistory()

  const onSubmitSuccess = async (jwtToken) => {
    const url = `${config.API_BASE_URL}/user`
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    const data = await response.json()

    localStorage.setItem('userId', JSON.stringify(data.userId))
    localStorage.setItem('userName', JSON.stringify(data.userName))

    Cookies.set('jwt_token', jwtToken, { expires: 30 })
    history.replace('/')
  }

  const onSubmitFailure = (message) => {
    setShowSubmitError(true)
    setErrorMsg(message)
  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      const { email, password } = values
      const userDetails = { email, password }
      const url = `${config.API_BASE_URL}/login`
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(userDetails),
      }
      const response = await fetch(url, options)
      const data = await response.json()
      if (data.ok === true) {
        onSubmitSuccess(data.jwtToken)
      } else {
        onSubmitFailure(data.err_msg)
      }
    },
  })

  return (
    <div className="login-form-container">
      <form className="form-container" onSubmit={formik.handleSubmit}>
        <div className="input-container">
          <label className="input-label" htmlFor="email">
            EMAIL
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="email-input-filed"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="error-message">{formik.errors.email}</p>
          ) : null}
        </div>

        <div className="input-container">
          <label className="input-label" htmlFor="password">
            PASSWORD
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="password-input-filed"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="error-message">{formik.errors.password}</p>
          ) : null}
        </div>

        <button type="submit" className="login-button">
          Login
        </button>
        
        {showSubmitError && <p className="error-message">*{errorMsg}</p>}

        <p className="signup-text">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginForm
