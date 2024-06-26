import React from 'react';
import PropTypes from 'prop-types';

const ExampleComponent: React.FC<{ name: string }> = ({ name }): React.ReactElement => <div>Hello, {name}!</div>;

ExampleComponent.propTypes = {
    name: PropTypes.string.isRequired
};

export default ExampleComponent;
