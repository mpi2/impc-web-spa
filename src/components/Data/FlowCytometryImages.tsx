import { Image } from "@/models/gene";
import { Card, Container, Row } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


type Props = {
  images: Array<Image>;
}

const FlowCytometryImages = (props: Props) => {
  const { images } = props;
  return (
    <Card>
      <h2>Flow cytometry results:</h2>
      <Container>
        <Row>
          <Slider
            dots
            infinite
            speed={500}
            slidesToShow={2}
            slidesToScroll={1}
          >
            {images.map((image, i) => (
              <div className="image-wrapper">
                <img key={i} src={image.jpegUrl} alt="" style={{ maxHeight: '500px' }}/>
                <b>
                  {image.biologicalSampleGroup === 'control' ? 'WT wildtype' : `KO ${image.zygosity}`}&nbsp;
                  {`${image.sex} value = %${image.associatedParameters?.[0]?.value}`}
                </b>
              </div>
            ))}
          </Slider>
        </Row>
      </Container>
    </Card>
  )
};

export default FlowCytometryImages;