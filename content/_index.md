+++
title = "Reference Architecture for AI"
description = "This is the reference architecture for AI to start collaboration and discussion."
+++

# Introduction 

There are tools for advanced analytics, including free ones from Google and Kaggle.

There are well known and validated deployment architectures for applications and the cloud.

Yet the number of practical applications is still tiny, and they retained niche implementations.

Let’s bridge the gap in knowledge between science and engineering to make fast, efficient and practical AI deployments.

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

{% mermaid() %}
flowchart LR;
id4[[This is the text in the box]];
id1([This is the text in the box]);
id2(This is the text in the box);
data1{{Data}};
    Data-- text -->B;
    A o--o B;
    B <--> C;
    C x--x D;
    id3{{This is the text in the box}};
    click A callback "Tooltip for a callback"
    click B "http://www.github.com" "This is a tooltip for a link"
    click A call callback() "Tooltip for a callback"
    click B href "http://www.github.com" "This is a tooltip for a link"
{% end %}
{% mermaid() %}
flowchart TB
    c1-->a2
    subgraph one
    a1-->a2
    end
    subgraph two
    b1-->b2
    end
    subgraph three
    c1-->c2
    end
  {% end %}

  {% mermaid() %}
  flowchart TD
    B["fa:fa-twitter for peace"]
    B-->C[fa:fa-ban forbidden]
    B-->D(fa:fa-spinner);
    B-->E(A fa:fa-camera-retro perhaps?);

  {% end %}

  {% mermaid() %}
  flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]

  {% end %}

  {% mermaid() %}
  flowchart LR
  subgraph TOP
    direction TB
    subgraph B1
        direction RL
        i1 -->f1
    end
    subgraph B2
        direction BT
        i2 -->f2
    end
  end
  A --> TOP --> B
  B1 --> B2
  {% end %}
