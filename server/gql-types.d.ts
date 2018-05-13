// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string;
    locations?: Array<IGraphQLResponseErrorLocation>;
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any;
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  interface IQuery {
    __typename: "Query";
    uptime: number | null;
  }

  interface IMutation {
    __typename: "Mutation";
  }

  interface IAUTHPROVIDERAUTH0 {
    idToken: string;
  }

  interface IUser {
    __typename: "User";
    ID: string;
    auth0UserId: string;
    created: any;
    updated: any;
    given_name: string | null;
    family_name: string | null;
    nickname: string | null;
    name: string | null;
    picture: string | null;
    gender: string | null;
    locale: string | null;
    email: string | null;
    email_verified: boolean | null;
  }

  type Node = IUser;

  interface INode {
    __typename: "Node";
    ID: string;
    created: any | null;
    updated: any | null;
  }
}

// tslint:enable
