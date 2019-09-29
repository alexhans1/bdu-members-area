/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import './Navbar.scss';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  User,
  List,
  LogOut,
  Award,
  LogIn,
  UserPlus,
  Shield,
  Calendar,
  Users,
  Edit,
} from 'react-feather';

import { logout } from '../../actions/AuthActions';
import logo from './bdu_white_logo.png';
import { calculateTotalUserDebt } from '../../helpers';

const NavbarDropdown = ({ link, pathname = '/', children = [] }) => {
  const childrenContainActiveLink = children
    .map(child => `/${child.props.link.url}` || '')
    .includes(pathname);

  return (
    <div
      className={`nav-item ${
        childrenContainActiveLink ? 'active' : ''
      } dropdown ${link.className}`}
    >
      <a
        className="nav-link dropdown-toggle"
        href="#"
        id="navbarDropdown"
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {link.icon}
        {link.title}
      </a>
      <div className="dropdown-menu bg-dark" aria-labelledby="navbarDropdown">
        {children}
      </div>
    </div>
  );
};

const NavbarLink = ({ link, pathname = '/' }) => {
  const isLinkActive = `/${link.url || ''}` === pathname && !link.onClick;
  return (
    <li className={`nav-item ${isLinkActive ? 'active' : ''}`}>
      {link.onClick ? (
        <button
          type="button"
          className={`nav-link d-flex align-items-center btn btn-link ${link.className}`}
          onClick={link.onClick}
        >
          {link.icon}
          {link.title}
        </button>
      ) : (
        <Link
          className={`nav-link d-flex align-items-center ${link.className}`}
          key={link.title}
          to={`/${link.url ? link.url : ''}`}
        >
          {link.icon}
          {link.title}
        </Link>
      )}
    </li>
  );
};

const Navbar = ({
  history: {
    location: { pathname },
  },
}) => {
  const dispatch = useDispatch();
  const { isAuthenticated, authenticatedUser, isAdmin } = useSelector(
    ({ user }) => ({
      isAuthenticated: user.isAuthenticated,
      authenticatedUser: user.authenticatedUserId
        ? user.users.find(({ id }) => user.authenticatedUserId === id)
        : {},
      isAdmin: user.authenticatedUserId
        ? user.users.find(({ id }) => user.authenticatedUserId === id)
            .position === 1
        : false,
    }),
  );

  const navbarLinks = [];
  if (isAuthenticated) {
    navbarLinks.push({
      title: 'Tournaments',
      icon: <Award size={18} className="mr-1" />,
    });
  } else {
    navbarLinks.push(
      ...[
        {
          title: 'Login',
          url: 'login',
          icon: <LogIn size={18} className="mr-1" />,
        },
        {
          title: 'Signup',
          url: 'signup',
          icon: <UserPlus size={18} className="mr-1" />,
        },
      ],
    );
  }
  if (isAdmin) {
    navbarLinks.push({
      title: 'Admin',
      icon: <Shield size={18} className="mr-1" />,
      children: [
        {
          title: 'Create Tournament',
          url: 'createTournament',
          icon: <Calendar size={18} className="mr-1" />,
        },
        {
          title: 'Members',
          url: 'member',
          icon: <Users size={18} className="mr-1" />,
        },
      ],
    });
  }
  if (isAuthenticated) {
    const totalDebtOfUser = calculateTotalUserDebt(authenticatedUser);

    navbarLinks.push({
      title: (
        <span
          className={`badge badge-${totalDebtOfUser > 0 ? 'danger' : 'info'}`}
        >
          {Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
          }).format(totalDebtOfUser)}
        </span>
      ),
      icon: <User size={18} className="mr-1" />,
      className: 'ml-md-auto align-collapse-right',
      children: [
        {
          title: 'My Tournaments',
          url: 'home',
          icon: <List size={18} className="mr-1" />,
          className: 'ml-auto',
        },
        {
          title: 'Edit Profile',
          url: 'edit',
          icon: <Edit size={18} className="mr-1" />,
        },
        {
          title: 'Logout',
          onClick: () => {
            dispatch(logout());
          },
          icon: <LogOut size={18} className="mr-1" />,
        },
      ],
    });
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <a className="navbar-brand" href="#">
        <img src={logo} className="mr-1" width="80" alt="logo" />
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav w-100">
          {navbarLinks.map(link =>
            link.children ? (
              <NavbarDropdown link={link} pathname={pathname} key={link.title}>
                {link.children.map(_link => (
                  <NavbarLink
                    link={_link}
                    pathname={pathname}
                    key={`${_link.url}_${_link.title}`}
                  />
                ))}
              </NavbarDropdown>
            ) : (
              <NavbarLink
                link={link}
                key={`${link.url}_${link.title}`}
                pathname={pathname}
              />
            ),
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
