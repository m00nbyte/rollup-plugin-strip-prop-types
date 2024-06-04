import React from 'react';
import PropTypes from 'prop-types';

const ExampleComponent = ({ name }) => <div>Hello, {name}!</div>;

ExampleComponent.propTypes = {
    name: PropTypes.string.isRequired
};

export default ExampleComponent;
