# Lattice Deformation
This project was a collaboration between Peyton Howardsmith and Riley Howardsmith in 2025 for their Honors CS559 final project at UW-Madison. For the class final, every team investigated a new computer graphics topic of their choice and presented their findings by putting it in action.

Some of the core ideas we discuss and implement in the project include:
- Instead of storing and updating the location of every single point on a shape, we use store and update the locations of lattice controls. We compute the locations of each of the shape's points using the locations of the control points assigned to it.
- Choosing the number of lattice control points: more points gives more control, fewer points allow easier control
- The use of lattice deformation in smooth animations
- Control points that control other control points: makes large scale changes easier
- When to share a lattice: objects that will move together should share a lattice, objects that will move separately should have their own lattice.
- The use of lattices in a hierarchy (e.g. if the torso moves, so should the limbs)

## Credit to CS559
*This set of web pages forms a "workbook" assignment for 
CS559, Computer Graphics at the University of Wisconsin for Spring 2025.*

Students should run a local web server and start with the `index.html` page.
The html files may not work as "files" without a local server.

Information about the class is available on the course web:
https://pages.graphics.cs.wisc.edu/559-sp25-regular/
https://pages.graphics.cs.wisc.edu/559-sp25-honors/

The `for_students` sub-directory contains files for the students to read and
modify. 

The `libs` sub-directory contains libraries used by the workbook. These
have separate open source licenses provided in the directories. 

The workbook content was primarily developed by Prof. Michael Gleicher with
assistance from the course staff, including Young Wu, over the years.

Students are granted the right to use the workbook content for their work
in class.

The workbook content is Copyright &copy; 2025, Michael Gleicher.

This workbook is provided under a Creative Commons Attribution-NonCommercial 4.0 International license. See https://creativecommons.org/licenses/by-nc/4.0/ for the explanation and https://creativecommons.org/licenses/by-nc/4.0/legalcode for the license itself.
