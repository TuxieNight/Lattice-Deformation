# Lattice Deformation
This project was a collaboration between Peyton Howardsmith and Riley Howardsmith in 2025 for their CS559 final project at UW-Madison. For the class final, every team investigated a new computer graphics topic of their choice and presented their findings by putting it in action.

Some of the core ideas we discuss and implement in the project include:
- Instead of storing and updating the location of every single point on a shape, we use store and update the locations of lattice controls. We compute the locations of each of the shape's points using the locations of the control points assigned to it.
- Choosing the number of lattice control points: more points gives more control, fewer points allow easier control
- The use of lattice deformation in smooth animations
- Control points that control other control points: makes large scale changes easier
- When to share a lattice: objects that will move together should share a lattice, objects that will move separately should have their own lattice.
- The use of lattices in a hierarchy (e.g. if the torso moves, so should the limbs)



