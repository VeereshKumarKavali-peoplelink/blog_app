import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import './index.css'
import config from '../../config'

const SignUpForm = () => {
  const [showSubmitError, setShowSubmitError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const history = useHistory()

  const onSubmitSuccess = () => {
    history.replace('/login')
  }

  const onSubmitFailure = (message) => {
    setShowSubmitError(true)
    setErrorMsg(message)
  }

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      email: '',
      gender: 'Male',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .required('Username is required'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      gender: Yup.string().required('Gender is required'),
    }),
    onSubmit: async (values) => {
      const { username, password, email, gender } = values
      const userDetails = { username, password, email, gender }
      const url = `${config.API_BASE_URL}/signup`
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

      if (data.msg === "User created successfully") {
        onSubmitSuccess()
      } else {
        onSubmitFailure(data.err_msg)
      }
    },
  })

  return (
    <div className="signup-form-container">
      <form className="form-container" onSubmit={formik.handleSubmit}>
        <div className="input-container">
          <label className="input-label" htmlFor="username">
            USERNAME
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="username-input-filed"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username ? (
            <p className="error-message">{formik.errors.username}</p>
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

        <div className="input-container">
          <label className="input-label" htmlFor="email">
            EMAIL
          </label>
          <input
            type="email"
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

        <div className="input-container-gender" style={{ marginBottom: '5px', marginTop: '5px' }}>
          <h1 className="input-label">Gender</h1>
          <div>
            <input
              type="radio"
              name="gender"
              id="genderMale"
              value="Male"
              checked={formik.values.gender === 'Male'}
              onChange={formik.handleChange}
            />
            <label htmlFor="genderMale">Male</label>
          </div>
          <div>
            <input
              type="radio"
              name="gender"
              id="genderFemale"
              value="Female"
              checked={formik.values.gender === 'Female'}
              onChange={formik.handleChange}
            />
            <label htmlFor="genderFemale" style={{ marginLeft: '5px' }}>Female</label>
          </div>
          {formik.touched.gender && formik.errors.gender ? (
            <p className="error-message">{formik.errors.gender}</p>
          ) : null}
        </div>

        <button type="submit" className="signup-button">
          Sign Up
        </button>

        {showSubmitError && <p className="error-message">*{errorMsg}</p>}

        <p className="login-text">
          <Link to="/login" className="login-link">LOGIN</Link>
        </p>
      </form>
    </div>
  )
}

export default SignUpForm
