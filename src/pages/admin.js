import React from "react"
import SignUp from "../components/formComponents/SignUp"
import ConfirmSignUp from "../components/formComponents/ConfirmSignUp"
import SignIn from "../components/formComponents/SignIn"
import Inventory from "../templates/Inventory"
import { Auth } from "aws-amplify"

class Admin extends React.Component {
  state = { formState: "signUp", isAdmin: false }
  toggleFormState = formState => {
    this.setState(() => ({ formState }))
  }
  async componentDidMount() {
    // check and update signed in state
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
    } catch (error) {
      console.log("error signing up:", error)
    }
    // sign up
    this.setState({ formState: "confirmSignUp" })
  }
  confirmSignUp = async form => {
    const { username, authcode } = form
    try {
      await Auth.confirmSignUp(username, authcode)
    } catch (error) {
      console.log("error confirming sign up", error)
    }
    // confirm sign up
    this.setState({ formState: "signIn" })
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
    } catch (error) {
      console.log("error signing in", error)
    }
    // signIn
    this.setState({ formState: "signedIn", isAdmin: true })
  }
  signOut = async () => {
    try {
      await Auth.signOut()
    } catch (error) {
      console.log("error signing out: ", error)
    }
    // sign out
    this.setState({ formState: "signUp" })
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
            <h1 className="text-5xl font-light">Admin Panel</h1>
          </div>
          {renderForm(formState)}
        </div>
      </div>
    )
  }
}

export default Admin
