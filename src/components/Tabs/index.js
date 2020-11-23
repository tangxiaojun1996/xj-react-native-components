import React, { Component } from 'react';
import TabContent from './TabContent';
import TabPanel from './TabPanel';

export default class Tabs extends Component {
	static TabPanel = TabPanel;

	render() {
	  return <TabContent {...this.props} />;
	}
}
