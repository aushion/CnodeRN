import React, { PureComponent, Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default class Tabs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabs: this.props.tabs
		};
	}
	handleClick = (i) => {
		let tabs = this.state.tabs;
		tabs.map((item, index) => {
			item.active = false;
			if (index === i) item.active = true;
		});
		this.setState({
			tabs: tabs
		});
		this.props.onTabChange(i);
	};

	render() {
		return (
			<View style={styles.flexWrp}>
				{this.state.tabs.map((item, index) => {
					return (
						<TouchableOpacity onPress={this.handleClick.bind(this, index)} key={item.id}>
							<View style={item.active ? [ styles.flexItem, styles.active ] : styles.flexItem}>
								<Text style={{ color: 'white' }}>{item.title}</Text>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	flexWrp: {
		flexDirection: 'row',
		marginTop: 30,
		width: '100%',
		display: 'flex',
		flexWrap: 'nowrap',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		backgroundColor: '#474546'
	},

	flexItem: {
		// flex: 'auto',
		textAlign: 'center',
		color: 'white',
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		fontSize: 14
	},

	active: {
		borderBottomColor: '#fff',
		borderBottomWidth: 4,
		borderStyle: 'solid'
	}
});
