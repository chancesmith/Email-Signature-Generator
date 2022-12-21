import { PhotoSignatureProps } from './App';
import Logo from './assets/ata_cpa_advisors.png';

const Signature = (props: PhotoSignatureProps) => {
  return (
    /*Container table */
    <table cellPadding={5} cellSpacing={0} className={'signature'}>
      <tbody>
        <tr>
          <td rowSpan={5}>
            {/* table containing the logo image */}
            <table cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <img className={'main-image'} src={Logo} alt={''} />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td className={'text-container-margin'} rowSpan={5}>
            {/* table containing the text content */}
            <table cellPadding={0} cellSpacing={0} className={'table-height'}>
              <tbody>
                <tr>
                  <td className={'blue-bold-text'}>
                    {props.fullName}
                    {props.credentials === '' ? '' : ', '}
                    {props.credentials === '' ? '' : props.credentials}
                  </td>
                </tr>
                <tr>
                  <td className={'regular-text'}>{props.title}</td>
                </tr>
                <tr>
                  <td className={'regular-text'}>
                    {props.phone === '' ? '' : 'P: '}
                    {props.phone === '' ? '' : props.phone}
                    {props.mobile === '' ? '' : 'M:'}{' '}
                    {props.mobile === '' ? '' : props.mobile}
                  </td>
                </tr>
                <tr>
                  {/* the class 'align-bottom' also controls the height of the row that this cell inhabits */}
                  <td className={'align-bottom'}>
                    {/* if props.calendlyLink is blank there will be nothing in this cell */}
                    <a
                      href={props.calendlyLink === '' ? '' : props.calendlyLink}
                    >
                      {props.calendlyLink === '' ? '' : 'SCHEDULE A MEETING'}
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
