import React from 'react'
import styled from 'styled-components'
import Footer from '../components/Footer';
import Navbar from '../components/Navbar'
import Slider from '../components/Slider';

const Container = styled.div`
    height: 60px;
`;
 
const Home = () => {
  return  (
    <Container>
        <Navbar/>
        <Slider/>
        <Footer/>
    </Container>
  );
};

export default Home