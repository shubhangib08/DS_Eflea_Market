import { useState } from "react";
import styled from "styled-components";
import $ from 'jquery';
import { RecordVoiceOverRounded } from "@material-ui/icons";
import {Redirect} from 'react-router'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: pink;
  background-size: cover;
  display: flex; 
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 40%;
  padding: 20px;
  background-color: white;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  margin: 20px 10px 0px 0px;
  padding: 10px;
`;

const Agreement = styled.span`
  font-size: 12px;
  margin: 20px 0px;
`;



const Button = styled.button`
  width: 40%;
  border: none;
  padding: 15px 20px;
  background-color: teal;
  color: white;
  cursor: pointer;
`;

const Register = () => {
  const [names, setNames] = useState("");
  const [lastName, setLastName] = useState("");
  const [useName, setUseName] = useState("");
  const [pwd, setPwd] = useState("");
  const [email, setEmail] = useState("");
  function transfer(){
    window.location.replace("http://localhost:3000/UserDetails");
  }
  function sendData(){
   /*fetch("http://localhost:8080/register/addUser",{
      method: 'post',
      body:{
        "name": names,
        "lastName": lastName,
        "useName": useName,
        "pwd": pwd,
        "email": email
      }
    }).then(data=>{
      alert("here");
    })*/
    $.post("http://localhost:8080/register/addUser",
           {name: names,
           lastName: lastName,
           useName: useName,
           pwd: pwd,
           email: email}
    )
   // alert("hello");
  }

  return (
    <Container>
      <Wrapper>
        <Title>CREATE AN EFLEA ACCOUNT</Title>
        <Button onClick={()=>{transfer()}}>View ALl Users Info</Button>
        <Form>
          <Input name="name" value={names} onChange={(e) => setNames(e.target.value)} placeholder="name" />
          <Input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="last name" />
          <Input name="useName" value={useName} onChange={(e) => setUseName(e.target.value)} placeholder="username" />
          <Input name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
          <Input name="pwd" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="password" />
          <Input name="pwd1" placeholder="confirm password" />
          <Agreement>
            By creating an account, I consent to the processing of my personal
            data in accordance with the <b>PRIVACY POLICY</b>
          </Agreement>
          <Button onClick={() => {sendData()}}> CREATE
        </Button>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Register;