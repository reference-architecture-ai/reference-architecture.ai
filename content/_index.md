+++
title = "Reference Architecture for AI"
description = "This is the reference architecture for AI to start collaboration and discussion."
+++

# Introduction 
There are tools for advanced analytics, including free ones from Google and Kaggle.

There are well-known and validated deployment architectures for applications and the cloud.

Yet the number of practical applications is still tiny, and they retained niche implementations.
While the benefits of AI are clear, there are still many gaps in AI architecture that need to be filled. For example, there is a gap between analytical tools and verified architectures for real-time deployments. This gap often stems from a lack of specific reference architectures and patterns, demonstrating the trade-offs between different technologies, libraries, and tools.

Let's bridge the gap in knowledge and drive a connection between science and engineering to make fast, efficient, and practical AI deployments.

# Core capabilities for AI/ML

{% mermaid() %}
flowchart LR;
subgraph 1  [AI core]
  data_intake(Data Acquisition);
  data_preprocessing(Data Preprocessing);
  data_validation(Data Validation);
  data_streaming(Data Streaming);
  ai_ml_pipe(AI ML Pipeline <br/> Model Training/Test/Validation);
  kg(Knowledge Graph);
  ML_inference(ML Inference);
  interaction(Interaction Layer<br/>Voice/VR/AR/Meta);
  click data_intake "./docs/intake/" "This is a tooltip for a link"
end

subgraph 2 [Enabling Capabilities]
  id1([This is the text in the box]);
  id2>This is the text in the box];
  id3{{This is the text in the box}};
  id4[This is the text in the box];
  end
  style 2 fill:#485fc754,stroke:#333,stroke-width:4px;
{% end %}
