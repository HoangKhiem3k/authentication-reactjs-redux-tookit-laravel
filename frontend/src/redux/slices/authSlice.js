import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authServices } from "../../services/authService";
import { getDateTime } from "../../helpers/checkEXPToken";

const initialState = {
  currentUser: null,
  isLoading: false,
  errorMessage: "",
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isLoading = false;
      state.errorMessage = "";
    },
    // logout: (state) => {
    //   state.currentUser = null;
    //   state.isLoading = false;
    //   state.errorMessage = "";
    //   console.log("init state", initialState);
    // },
    //   addTodo: (state, action) => {
    //     state.push(action.payload);
    //   }, // action creators
    //   toggleTodoStatus: (state, action) => {
    //     const currentTodo = state.find((todo) => todo.id === action.payload);
    //     if (currentTodo) {
    //       currentTodo.completed = !currentTodo.completed;
    //     }
    //   },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoading = false;
        console.log("state.currentUser ", state.currentUser);
      })
      .addCase(login.rejected, (state, action) => {
        state.errorMessage = action.payload;
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.isLoading = false;
        state.errorMessage = "";
        console.log("state.currentUser ", state.currentUser);
      });
  },
});

export const { loginSuccess } = authSlice.actions;
export const login = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    const res = await authServices.signin(loginData.loginInfo);
    if (res.data.statusCode === 200) {
      const authInformation = {
        name: "Admin",
        email: "admin@gmail.com",
        access_token: res.data.access_token,
        access_token_exp: res.data.access_token_exp,
        refresh_token: res.data.refresh_token,
        refresh_token_exp: res.data.refresh_token_exp,
      };
      loginData.navigate("/admin");
      return authInformation;
    }
    return rejectWithValue(res.data.message);
  }
);
export const logout = createAsyncThunk("auth/logout", async (logoutData) => {
  if (logoutData.currentUser.access_token_exp > getDateTime()) {
    await authServices.logout(
      logoutData.currentUser.refresh_token,
      logoutData.currentUser.access_token
    );
    await authServices.deleteRefreshToken(logoutData.currentUser.refresh_token);
    localStorage.clear();
    logoutData.navigate("/login");
    return "Logout success";
  } else {
    await authServices.deleteRefreshToken(logoutData.currentUser.refresh_token);
    localStorage.clear();
    logoutData.navigate("/login");
    return "Logout success";
  }
});
export default authSlice;
