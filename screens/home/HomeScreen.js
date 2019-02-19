import React from 'react';
import {
		Image,
		Platform,
		ScrollView,
		RefreshControl,
		StyleSheet,
		Text,
		TouchableOpacity,
		View,
		FlatList,
		ActivityIndicator
} from 'react-native';
import {WebBrowser} from 'expo';

import RestTools from '../../tools/_RestTools';
import Tabs from '../../components/Tabs';
import _Const from '../../tools/_Const';
import moment  from 'moment';

moment.locale('zh-cn')
totalPage = 20;
export default class HomeScreen extends React.Component {
		static navigationOptions = {
				header: null
		};
		constructor(props) {
				super(props);
				this.state = {
						data: [],
						loading: true,
						params: {
								page: 1,
								tab: 'all',
								limit: 20,
								mdrender: 'true'
						},
						current: 0,
						showFoot: 0, // 控制foot， 0：隐藏footer  1：已加载完成,没有更多数据   2 ：显示加载中
						isRefreshing: false, //下拉控制
						error: false,
						errorInfo: ""
				};
		}

		getData = (params) => {
				RestTools
						.fetchRequest('/topics', 'GET', params)
						.then((res) => {
								//请求成功
								if (res.success) {
										//这里设定服务器返回的header中statusCode为success时数据返回成功
										let foot = 0;
										if(params.page>=totalPage) {
											foot = 1;
										}
										this.setState({
												data: this
														.state
														.data
														.concat(res.data),
												loading: false,
												showFoot: foot,
												isRefreshing: false
										});
								} else {
										//服务器返回异常，设定服务器返回的异常信息保存在 header.msgArray[0].desc
										this.setState({loading: false});
										console.log(res.error);
								}
						})
						.catch((err) => {
								//请求失败
								this.setState({loading: false, error: true, errorInfo: err});
								console.log(err);
						});
		}
		componentDidMount() {
				this.getData(this.state.params)
		}
		_renderItem = ({item}) => <MyListItem
				data={item}
				id={item.id}
				title={item.title}
				onPressItem={this._onPressItem}/>;

		_keyExtractor = (item, index) => item.id;

		_showSeparator = () => {
				return <View style={{
						height: 0.5,
						backgroundColor: '#ccc'
				}}/>;
		};

		handleTab = (index) => {
				this.setState({current: index})
				let {tab,...others} = this.state.params;
				tab = _Const.tabs[index].id;
				this.setState({
					params: {
						tab,
						page:1,
						limit: 20,
						mdrender: 'true'
					},
					data: [],
					loading: true
				},() =>{
					this.getData(this.state.params)
				})
				
		}

		_onPressItem = (item) => {
				console.log(item)
				// WebBrowser.openBrowserAsync('https://cnodejs.org/topic/' + item)
				this.props.navigation.navigate('Detail',{...item})
		}

		renderLoaingView = () => {
				return (
						<View style={styles.container}>
								<Tabs tabs={_Const.tabs} onTabChange={this.handleTab}/>
								<ActivityIndicator size="large" color="#0000ff" style={styles.container}/>
						</View>
				)
		}
		handleRefresh = () => {
			const {page, ...others} = this.state.params;
			this.setState({
					params:{
						page: 1,
						...others
					},
					isRefreshing:true,//tag,下拉刷新中，加载完全，就设置成flase
					data:[]
			},() => {
				console.log('params',this.state.params)
				this.getData(this.state.params)
			});
	}

		renderErrorView = () => {
				return (
						<View style={[styles.container,
						 {justifyContent: 'center', alignItems: 'center'}]}
						 >
								<Text onPress={this.handleRefresh}>
										Fail
								</Text>
						</View>
				)
		}
		_renderFooter() {
				if (this.state.showFoot === 1) {
						return (
								<View
										style={{
										height: 30,
										alignItems: 'center',
										justifyContent: 'flex-start'
								}}>
										<Text
												style={{
												color: '#999999',
												fontSize: 14,
												marginTop: 5,
												marginBottom: 5
										}}>
												没有更多数据了
										</Text>
								</View>
						);
				} else if (this.state.showFoot === 2) {
						return (
								<View style={styles.footer}>
										<ActivityIndicator/>
										<Text>正在加载更多数据...</Text>
								</View>
						);
				} else if (this.state.showFoot === 0) {
						return (
								<View style={styles.footer}>
										<Text></Text>
								</View>
						);
				}
		}
		_onEndReached() {
				let {
						page,
						...others
				} = this.state.params;
				//如果是正在加载中或没有更多数据了，则返回
				if (this.state.showFoot != 0) {
						return;
				}
				//如果当前页大于或等于总页数，那就是到最后一页了，返回
				if ((page != 1) && (page >= totalPage)) {
						return;
				} else {
						page++;
				}
				//底部显示正在加载更多数据
				this.setState({showFoot: 2});
				//获取数据
				this.setState({
						params: {
								page,
								...others
						}
				}, () => {
						this.getData(this.state.params);
				})
		}

		renderData = (data) => {
				return (
						<View style={styles.container}>
									<Tabs tabs={_Const.tabs} onTabChange={this.handleTab}/>
								<FlatList
										contentContainerStyle={styles.contentContainer}
										data={data}
										keyExtractor={this._keyExtractor}
										renderItem={this._renderItem}
										onEndReached={this._onEndReached.bind(this)}
										onEndReachedThreshold={1}
										ItemSeparatorComponent={this._showSeparator}
										ListFooterComponent={this._renderFooter.bind(this)}
										 //为刷新设置颜色
										refreshControl={
											<RefreshControl
													refreshing={this.state.isRefreshing}
													onRefresh={this.handleRefresh.bind(this)}//因为涉及到this.state
													colors={['#ff0000', '#00ff00','#0000ff','#3ad564']}
													progressBackgroundColor="#ffffff"
											/>
									}
										/>
						</View>
				)
		}

		render() {
				const {data, loading, error} = this.state;
				if (loading && !error) {
						return this.renderLoaingView();
				} else if (error) {
						return this.renderErrorView()
				} else {
						return this.renderData(data)
				}
		}
}

class MyListItem extends React.PureComponent {
		_onPress = () => {
				const {id,title} = this.props
				this.props.onPressItem({id,title});
		};

		render() {
				const textColor = this.props.selected
						? 'red'
						: 'black';
				const data = this.props.data;
				const tag = data.top?'置顶':data.good?'精华':_Const.tab[data.tab];
				return (
						<TouchableOpacity onPress={this._onPress} style={{
								padding: 10
						}}>
								<View style={styles.itemTop}>
										<View>
											<Image 
												style={{width: 40,height: 40}}
												source={{uri: data.author.avatar_url}} />
										</View>
									
										<View style={{display: 'flex',flexDirection: 'column', justifyContent: 'space-around',marginLeft: 10}}>
												<View style={{fontStyle: 'bold'}}>
													<Text>{data.author.loginname} <Text style={{color: 'green'}}>>{tag}</Text> </Text>
												</View>
												<Text>{moment(data.create_at).fromNow()}</Text>
										</View>
								</View>
								<View >
										<Text style={{
												color: textColor
										}}>{this.props.title}</Text>
								</View>
						</TouchableOpacity>
				);
		}
}

const styles = StyleSheet.create({
		container: {
				flex: 1,
				backgroundColor: '#fff'
		},

		// contentContainer: { 	paddingTop: 30 },
		itemTop: {
				display: 'flex',
				flexDirection: 'row',
				fontSize: 12,
				marginBottom: 10
		},
		tag: {
				width: 44,
				paddingLeft: 2,
				paddingRight: 2,
				paddingTop: 3,
				paddingBottom: 3,
				borderRadius: 3,
				textAlign: 'center',
				backgroundColor: '#eee'
		},
		good: {
				backgroundColor: '#80bd01',
				color: '#fff'
		},
		footer: {
				flexDirection: 'row',
				height: 24,
				justifyContent: 'center',
				alignItems: 'center',
				marginBottom: 10
		},
		
});
