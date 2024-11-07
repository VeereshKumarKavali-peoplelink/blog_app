import {Link, withRouter} from 'react-router-dom'

import Cookies from 'js-cookie'

import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = (props) => {

    const onClickLogout = () => {
        const { history } = props
        Cookies.remove('jwt_token')
        history.replace('/login')
    }

    return (
        <nav className="nav-header">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="button-container">
            <button
                    type="button"
                    className="logout-btn"
                    onClick={onClickLogout}
                >
                    Logout
                </button>
            </div>
            
            <div className="blog-container">
                <h1 className="blog-title">Dev Blog</h1>
                <ul className="nav-menu">
                    <Link className="nav-link" to="/">
                        <li>Home</li>
                    </Link>
                    <Link className="nav-link" to="/about">
                        <li>About</li>
                    </Link>
                    <Link className="nav-link" to="/contact">
                        <li>Contact</li>
                    </Link>
                </ul>
            </div>
           
        </nav>)
}

export default withRouter(Header)