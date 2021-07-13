import { StyleSheet } from 'react-native';
import { getHeight, getWidth, isIphoneX } from './dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: "center",
        alignItems: "center"
    }, textInput: {
        width: "100%",
        height: "100%",
        fontSize: 14,
        color: "black",

    },
});
export default styles;