declare namespace StyleCssNamespace {
  export interface StyleCss {
    notfound: string;
  }
}

declare const StyleCssModule: StyleCssNamespace.StyleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleCssNamespace.StyleCss;
};

export = StyleCssModule;
