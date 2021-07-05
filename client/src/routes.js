import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Auth = (props) => {
	const user = useSelector((state) => state.user);

	if (props.type) {
		return (
			<Route exact={props.exact} path={props.path}>
				{user.uname && user.type === props.type && props.children}
				{!(user.uname && user.type === props.type) && <Redirect to='/dashboard' />}
			</Route>
		);
	}
	return (
		<Route exact path={props.path}>
			{user.uname && props.children}
			{!user.uname && <Redirect to='/signin' />}
		</Route>
	);
};

const UnAuth = (props) => {
	const user = useSelector((state) => state.user);
	return (
		<Route exact path={props.path}>
			{user.uname && <Redirect to='/dashoard' />}
			{!user.uname && props.children}
		</Route>
	);
};

export { Auth, UnAuth };
