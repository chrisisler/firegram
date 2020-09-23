import styled from 'styled-components';

export enum Pad {
  None = '0',
  XSmall = '0.25rem',
  Small = '0.5rem',
  Medium = '1rem',
  Large = '2rem',
  XLarge = '3rem',
}

interface Props {
  center?: boolean;
  padding?: Pad | string;
}

const Div = styled.div`
  align-items: ${({ center }: Props) => (center ? 'center' : 'initial')};
  padding: ${({ padding }: Props) => padding};
`;

export const Columns = styled(Div)`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: ${(props: { pad?: Pad }) => props?.pad ?? Pad.None};
  }
`;

export const Rows = styled(Div)`
  display: flex;

  & > *:not(:last-child) {
    margin-right: ${(props: { pad?: Pad }) => props?.pad ?? Pad.None};
  }
`;
