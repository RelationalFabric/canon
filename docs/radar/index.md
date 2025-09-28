# Technology Radar

The Canon Technology Radar provides a comprehensive view of tools, techniques, features, and data formats recommended for Canon and its consumers.

## Interactive Radar

<div id="tech-radar-container">
  <iframe 
    src="./radar.html" 
    width="100%" 
    height="800" 
    frameborder="0"
    title="Canon Technology Radar">
  </iframe>
</div>

## About This Radar

This technology radar is built using [build-your-own-radar](https://github.com/zalando/tech-radar) and tracks recommendations across four quadrants:

- **Tools & Libraries** - Third-party libraries, build tools, and development utilities
- **Techniques & Patterns** - Architectural patterns, development practices, and type system techniques  
- **Features & Capabilities** - Runtime features, development features, and integration capabilities
- **Data Structures, Formats & Standards** - Data structures, serialization formats, identity standards, and schema standards

## Rings

- **Adopt** - Strong recommendation. Proven, stable, and recommended for use
- **Trial** - Evaluate for adoption. Worth exploring and evaluating for your context
- **Assess** - Investigate further. Keep under review and assess for potential future use
- **Hold** - Not recommended. Avoid or replace with better alternatives

## Methodology

For detailed information about our radar methodology, see [Radar Methodology](../docs/radar-methodology).

## Data Source

The radar data is maintained in [planning/technology-radar/data.yaml](../../planning/technology-radar/data.yaml) and converted to CSV format for visualization.

## Contributing

To suggest changes to the technology radar:

1. Edit the [data.yaml](../../planning/technology-radar/data.yaml) file
2. Submit a pull request with your changes
3. The radar will be automatically updated when the PR is merged