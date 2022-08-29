import { useEffect, useState } from "react";
import styled from "styled-components";
import $ from 'jquery';

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
const stylesBorder = {
    border: '1px solid grey'
};
const UserDetails = () => {
    var temp = [];
  const [details, setDetails] = useState(temp);

  
  useEffect(()=>{
      $.getJSON("http://localhost:8080/register/getUser")
      .then(data=>{
        data = JSON.parse(JSON.stringify(data));
        console.log(data.data);
        setDetails(data.data);
      });
  },[])
  return (
    <Container>
      <Wrapper>
        <Title>USER DETAILS</Title>
        <table style={stylesBorder}>
            <tr>
                <th>Name</th>
                <th>Last Name</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Password</th>
            </tr>
            {details.map((k,v)=>(
                <tr>
                    <td>{details[v]["name"]}</td>
                    <td>{details[v]["lastName"]}</td>
                    <td>{details[v]["useName"]}</td>
                    <td>{details[v]["email"]}</td>
                    <td>{details[v]["pwd"]}</td>
                </tr>
            ))}
        </table>
      </Wrapper>
    </Container>
  );
};

export default UserDetails;