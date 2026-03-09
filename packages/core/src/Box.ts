import styled from "styled-components";

export const Box = styled.div`
  padding: ${({ theme }) => theme.spacing?.md ?? "16px"};
  background-color: ${({ theme }) => theme.colors?.primary};
`;
