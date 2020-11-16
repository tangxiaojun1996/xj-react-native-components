import React from 'react';
import Bar from './bar';

Bar.Horizontal = props => <Bar {...props} horizontal={true} />;

Bar.Vertical = props => <Bar {...props} horizontal={false} />;

export default Bar;
