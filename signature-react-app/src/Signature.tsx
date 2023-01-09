import { PhotoSignatureProps } from "./App";

const Signature = (props: PhotoSignatureProps) => {
  return (
    /*Container table */
    <table
      cellPadding={5}
      cellSpacing={0}
      style={{
        height: "100px",
        maxWidth: "100%",
        whiteSpace: "nowrap",
        background: "#FFFFFF",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <tbody>
        <tr>
          <td rowSpan={5}>
            {/* table containing the logo image */}
            <table cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <a href="https://ata.cpa" target="_blank" rel="noreferrer">
                      <img
                        style={{ width: "120px", height: "90px" }}
                        src={props.logo}
                        alt={"ata-logo"}
                      />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td rowSpan={5}>
            {/* table containing the text content */}
            <table cellPadding={0} cellSpacing={0} style={{ height: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#4899d5",
                      fontFamily: "helvetica, bold",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {props.fullName}
                    {props.credentials === "" ? "" : ", "}
                    {props.credentials === "" ? "" : props.credentials}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#A2A8AB",
                      fontFamily: "helvetica",
                      fontSize: "14px",
                    }}
                  >
                    {props.title}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: "#A2A8AB",
                      fontFamily: "helvetica",
                      fontSize: "14px",
                    }}
                  >
                    {props.phone === "" ? "" : "P: "}
                    {props.phone === "" ? "" : props.phone}
                    {props.mobile === "" ? "" : " M:"}
                    {props.mobile === "" ? "" : props.mobile}
                  </td>
                </tr>
                <tr>
                  {/* the class 'align-bottom' also controls the height of the row that this cell inhabits */}
                  <td style={{ height: "60%", verticalAlign: "bottom" }}>
                    {/* if props.calendlyLink is blank there will be nothing in this cell */}
                    <a
                      href={props.calendlyLink === "" ? "" : props.calendlyLink}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {props.calendlyLink === "" ? "" : "SCHEDULE A MEETING"}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Signature;
