import "./css/login.css";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { requestLogin } from "../services/authService.js";
import { setUser } from "../features/auth/authSlice.js";
import { toast } from "react-toastify";
import { getAdminPost, getAllPost, getUserPost } from "../services/postService";
import { setpostList } from "../features/postSlice";
import { socket, SocketContext } from "../context/socket";
import { useContext } from "react";
import { useEffect } from "react";
// import { setpostList } from "../features/postSlice.js";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const handleLogin = async (values) => {
    const response = await requestLogin(values);
    console.log(response);
    if (!response.success) {
      setFieldError("username", response.message);
    } else {
      dispatch(setUser(response.user));
      console.log("response", response);
      const postList = handleGetPostlist(response.user);
      socket.emit("new user", {
        username: response.user.email,
        userType: response.user.userType,
      });
      if (response.user.userType != "admin") {
        navigate("/posts");
      } else {
        navigate("/posts");
      }
    }
  };
  console.log("before usefeect login");
  useEffect(() => {
    alert("started");
    socket.on("connect", () => {
      console.log("I'm connected with the back-end", socket.id);
    });
    socket.on("new post", () => {
      console.log("New post received", socket.id);
      alert("new post received");
    });
    socket.on("new Donation", () => {
      console.log("new Donation received", socket.id);
      alert("new  Donation received");
    });
  }, []);

  const handleGetPostlist = async (user) => {
    console.log("handlegetpostlist", user);
    if (user.userType != "admin") {
      const response = await getUserPost({
        username: user.email,
      });

      dispatch(setpostList(response.posts));
    } else {
      const response = await getAdminPost({});

      dispatch(setpostList(response.posts));
    }
  };
  const loginvalidationschema = yup.object({
    username: yup.string().email().required("Please enter valid email address"),
    password: yup.string().required("please enter your password"),
  });

  const {
    formik,
    handleSubmit,
    values,
    handleChange,
    handleBlur,
    touched,
    errors,
    setFieldError,
  } = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: loginvalidationschema,
    onSubmit: (values) => {
      handleLogin(values);
    },
  });
  return (
    <div className="login">
      <h3>Login</h3>
      {touched.username && errors.username ? (
        <div className="error">{errors.username}</div>
      ) : (
        ""
      )}
      <Form className="loginForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {/* <Form.Text className="text-muted">
            your email is your username
          </Form.Text> */}
        </Form.Group>
        {touched.password && errors.password ? (
          <div className="error">{errors.password}</div>
        ) : (
          ""
        )}
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="loginbtn">
          Login
        </Button>
        <Form.Group className="mb-3 loginhelper" controlId="formBasicCheckbox">
          <p>
            Not a member?{" "}
            <a href="" onClick={() => navigate("/register")}>
              Register
            </a>
          </p>
          <p>
            <a href="" onClick={() => navigate("/forgotpassword")}>
              Forgot Password
            </a>
          </p>
        </Form.Group>
      </Form>
    </div>
  );
}

export default Login;
