import React, { PureComponent } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Tabs from '../../src/components/Tabs';
import Text from '../../src/components/Text';

export default class TabsExample extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <Tabs>
          <Tabs.TabPanel>
            <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: 'red' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {new Array(100).fill(0).map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Text key={index}>{`${index}`}</Text>
                ))}
              </ScrollView>
            </View>
          </Tabs.TabPanel>

          <Tabs.TabPanel>
            <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: 'blue' }} />
          </Tabs.TabPanel>

          <Tabs.TabPanel>
            <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: 'yellow' }} />
          </Tabs.TabPanel>
        </Tabs>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
