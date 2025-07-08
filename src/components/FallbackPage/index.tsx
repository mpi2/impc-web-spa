import Search from "@/components/Search";
import { Container, Spinner } from "react-bootstrap";
import Card from "@/components/Card";

const FallbackPage = () => (
  <>
    <Search />
    <Container className="page">
      <Card>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        Loading
      </Card>
    </Container>
  </>
);

export default FallbackPage;
