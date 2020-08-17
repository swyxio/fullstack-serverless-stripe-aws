import React from "react"
import SignUp from "../components/formComponents/SignUp"
import ConfirmSignUp from "../components/formComponents/ConfirmSignUp"
import SignIn from "../components/formComponents/SignIn"
import Inventory from "../templates/Inventory"
import { Auth } from "aws-amplify"
import { toast } from "react-toastify"

class Admin extends React.Component {
  state = { formState: "signUp", isAdmin: false }
  toggleFormState = formState => {
    this.setState(() => ({ formState }))
  }
  async componentDidMount() {
    // check and update signed in state
    const user = await Auth.currentAuthenticatedUser()
    const {
      signInUserSession: {
        idToken: { payload },
      },
    } = user
    console.log({ payload })
    
    // signIn
    if (
      payload["cognito:groups"] &&
      payload["cognito:groups"].includes("Admin")
    ) {
      this.setState({ formState: "signedIn", isAdmin: true })
    }
  }
  signUp = async form => {
    const { username, email, password } = form
    try {
      const user = await Auth.signUp({
        username,
        password,
        attributes: {
          email, // optional
          // phone_number,   // optional - E.164 number convention
          // other custom attributes
        },
      })
      console.log({ user })
      // sign up
      this.setState({ formState: "confirmSignUp" })
    } catch (error) {
      toast("Error signing up: " + error.message, {
        position: toast.POSITION.TOP_LEFT,
      })
      console.log("error signing up:", error)
    }
  }
  confirmSignUp = async form => {
    const { username, authcode } = form
    try {
      await Auth.confirmSignUp(username, authcode)
      // confirm sign up
      this.setState({ formState: "signIn" })
    } catch (error) {
      toast("Error confirming: " + error.message, {
        position: toast.POSITION.TOP_LEFT,
      })
      console.log("error confirming sign up", error)
    }
  }
  signIn = async form => {
    const { username, password } = form

    try {
      const user = await Auth.signIn(username, password)
      const {
        signInUserSession: {
          idToken: { payload },
        },
      } = user
      console.log({ payload })
      
      // signIn
      if (
        payload["cognito:groups"] &&
        payload["cognito:groups"].includes("Admin")
      ) {
        this.setState({ formState: "signedIn", isAdmin: true })
        // localStorage.setItem("userSession", JSON.stringify({ formState: "signedIn", isAdmin: true }))
      } else {

        toast("YOU ARE NOT ADMIN GET OUT", {
          position: toast.POSITION.TOP_LEFT,
        })
        toast("AND STAY OUT", {
          position: toast.POSITION.TOP_LEFT,
        })
      }
    } catch (error) {
      toast("Error signing in: " + error.message, {
        position: toast.POSITION.TOP_LEFT,
      })
      console.log("error signing in", error)
    }
  }
  signOut = async () => {
    try {
      await Auth.signOut()
      // sign out
      this.setState({ formState: "signUp" })
    } catch (error) {
      toast("Error signing out: " + error.message, {
        position: toast.POSITION.TOP_LEFT,
      })
      console.log("error signing out: ", error)
    }
  }

  render() {
    const { formState, isAdmin } = this.state
    const renderForm = (formState, state) => {
      switch (formState) {
        case "signUp":
          return (
            <SignUp
              {...state}
              signUp={this.signUp}
              toggleFormState={this.toggleFormState}
            />
          )
        case "confirmSignUp":
          return <ConfirmSignUp {...state} confirmSignUp={this.confirmSignUp} />
        case "signIn":
          return (
            <SignIn
              {...state}
              signIn={this.signIn}
              toggleFormState={this.toggleFormState}
            />
          )
        case "signedIn":
          return isAdmin ? (
            <Inventory {...state} signOut={this.signOut} />
          ) : (
            <h3>Not an admin</h3>
          )
        default:
          return null
      }
    }

    return (
      <div className="flex flex-col">
        <div className="max-w-fw flex flex-col">
          <div className="pt-10">
            <h1 className="text-5xl font-light text-center underline border border-red-500 p-5">Admin Panel</h1>
          </div>
          {renderForm(formState)}
        </div>
      </div>
    )
  }
}

export default Admin
