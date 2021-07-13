import React, { useState, useEffect, useMemo } from 'react'
import { View, TextInput, TouchableOpacity, Text, Platform } from 'react-native'
import styles from './styles'
import { connect } from 'react-redux'
import * as Actions from '../redux/actions'


function Login({ navigation }) {
    const [username, setUsername] = useState(Platform.OS === "ios" ? "halil" : "halilandroid");
    const [userId, setUserId] = useState(Platform.OS === "ios" ? "1" : "2");
    const [isHost, setIsHost] = useState(Platform.OS === "ios" ? false : true);
    const [room, setRoom] = useState(Platform.OS === "ios" ? "test5" : "test");
    return (
        <View style={styles.container}>
            <View style={{ width: "100%", height: 50, borderWidth: 1 }}>
                <TextInput
                    allowFontScaling={false}
                    style={styles.textInput}
                    value={username}
                    keyboardType={"default"}
                    placeholder={"Kullanıcı adı giriniz"}
                    placeholderTextColor={"black"}
                    onChangeText={(e) => setUsername(e)}
                />
            </View>

            <View style={{ width: "100%", height: 50, borderWidth: 1 }}>
                <TextInput
                    allowFontScaling={false}
                    style={styles.textInput}
                    value={userId}
                    keyboardType={"default"}
                    placeholder={"UserId"}
                    placeholderTextColor={"black"}
                    onChangeText={(e) => setUserId(e)}
                />
            </View>
            <TouchableOpacity style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isHost ? "green" : "red", justifyContent: "center", alignItems: "center" }} onPress={() => setIsHost(!isHost)}>
                <Text>+</Text>
            </TouchableOpacity>
            <View style={{ width: "100%", height: 50, marginTop: 30, borderWidth: 1 }}>
                <TextInput
                    allowFontScaling={false}
                    style={styles.textInput}
                    value={room}
                    keyboardType={"default"}
                    placeholder={"Oda ismini giriniz"}
                    placeholderTextColor={"black"}
                    onChangeText={(e) => setRoom(e)}
                />
            </View>
            <TouchableOpacity style={{ width: 150, height: 50, backgroundColor: "yellow", marginTop: 30, borderRadius: 30, justifyContent: "center", alignItems: "center" }} onPress={() => navigation.navigate("Chat", { username, userId, isHost, room })}>
                <Text>ODA OLUŞTUR</Text>
            </TouchableOpacity>
        </View >
    )
}


const mapStateToProps = state => {
    const { user } = state.login;
    return {
        user
    }
}

export default LoginContainer = connect(mapStateToProps, Actions)(Login); 