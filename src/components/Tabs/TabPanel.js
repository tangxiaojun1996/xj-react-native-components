import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

const TabPanel = ({ children, ...props }) => (
  <View style={{ flex: 1, alignSelf: 'stretch' }} {...props}>
    {React.Children.toArray(children)}
  </View>
);

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TabPanel;
