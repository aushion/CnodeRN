import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, WebView} from 'react-native';
import TransferHtml from '../../tools/TransferHtml'
import RestTools from '../../tools/_RestTools';

export default class DetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title','详情'),
    };
  };
  constructor(props){
    super(props)
    this.state = {
      id: this.props.navigation.getParam('id'),
      data: null,
      loading: true,
    }
  }

  componentDidMount() {
    const id = this.state.id;
    this.getData(id)
  }

  getData = (id) => {
    RestTools.fetchRequest('/topic/'+id,'GET',{mdrender: 'true'})
      .then((res) => {
        if(res.success){
          this.setState({
            data: res.data,
            loading: false,
          })
        }else{
          	//服务器返回异常，设定服务器返回的异常信息保存在 header.msgArray[0].desc
            this.setState({loading: false});
            console.log(res.error);
        }
      })
      .catch((err) => {
        //请求失败
        this.setState({loading: false});
        console.log(err);
    });
  }

  renderLoadingView = () => {
    return (<View style={styles.container}>
								<ActivityIndicator size="large" color="#0000ff" style={styles.container}/>
						</View>)
  }

  renderDataView = () => {
    const html = TransferHtml(this.state.data.content).replace(/src=\"/g,'src=\"http:').replace(/http:http/g,'http')
    //处理图片链接
    return (<View style={styles.container} >
              <WebView
                originWhitelist={['*']}
                source={{ html: html }}
              />
          </View>)
  }

  render() {
    const {loading} = this.state;
    if(loading){
      return this.renderLoadingView()
    }else{
      return this.renderDataView()
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  
});
