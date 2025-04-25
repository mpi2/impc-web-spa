import { Alert } from "react-bootstrap";
import Link from "next/link";
import { PropsWithChildren } from "react";

type Props = {
  dataReleaseVersion: string;
}

const PublicationDataAlert = (props: PropsWithChildren<Props>) => {
  const { dataReleaseVersion, children } = props;
  return (
    <Alert variant="landing-page">
      <Alert.Heading>Attention</Alert.Heading>
      {!!children ?
        children
        : (
          <p>
            This publication page originally used the Data Release {dataReleaseVersion}
          </p>
        )
      }
      <hr/>
      <Link
        className="link primary"
        href={`https://ftp.ebi.ac.uk/pub/databases/impc/all-data-releases/release-0${dataReleaseVersion}/`}>
        Link to FTP site
      </Link>
    </Alert>
  );
};

export default PublicationDataAlert;