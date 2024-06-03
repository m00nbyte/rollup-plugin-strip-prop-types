import React from 'react';
import PropTypes from 'prop-types';

const MyComponent: React.FC<{ name: string }> = ({ name }) => <div>Hello, {name}!</div>;

MyComponent.propTypes = {
    name: PropTypes.string.isRequired
};

export default MyComponent;
