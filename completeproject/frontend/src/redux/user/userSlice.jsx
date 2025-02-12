import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    tokenexpiration: "",
    idnumber: "",
    phone: "",
    email: "",
    username: "",
    doctor: false,
    admin: false,
  },
  //A reducer is used to update a state, just call its functions to update the state,eg ,you wanna update username, call reducer,we can not change the redux store directly ,we need to use functions defined in the reducer,call "login" using the "useDispatch" hook from a component when user needs to update username,email.
  reducers: {
    login: (state, action) => {
      console.log("from userslice", action.payload);
      const {
        idnumber,
        phone,
        email,
        username,
        doctor,
        admin,
        tokenexpiration,
      } = action.payload;
      state.idnumber = idnumber;
      state.phone = phone;
      state.email = email;
      state.username = username;
      state.doctor = doctor;
      state.admin = admin;
      state.tokenexpiration = tokenexpiration;
    },
    logout: (state) => {
      state.idnumber = "";
      state.phone = "";
      state.email = "";
      state.username = "";
      state.doctor = false;
      state.admin = false;
      state.tokenexpiration = "";
    },
  },
});

// userSlice.actions contains all the reducer functions like login on the userSlice object
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
