Feature: Submit customer survey

  Scenario Outline: Submit survey with valid customer feedback
    Given the customer survey is available
    When the customer selects score "<score>"
    And selects "<recommendation>" as a valued feature
    And enters feedback "<feedback>"
    And completes the survey
    Then the survey completion message is displayed

    Examples:
      | score | recommendation        | feedback             |
      | 1     | Performance           | Poor experience      |
      | 3     | Ease of use           | Average experience   |
      | 5     | Customization options | Excellent experience |