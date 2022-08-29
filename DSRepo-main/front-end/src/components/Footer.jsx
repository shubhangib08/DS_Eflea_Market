import styled from "styled-components"

const Container = styled.div`
display:flex;
`
const Left = styled.div`
flex:1;
display:flex;
`

const Desc = styled.p``;

const Footer = () => {
  return (
    <Container>
        <Left>
            <Desc>
                This application is solely for the purpose of coursework and is inspired by resources online.
            </Desc>
        </Left>
    </Container>
  )
}

export default Footer