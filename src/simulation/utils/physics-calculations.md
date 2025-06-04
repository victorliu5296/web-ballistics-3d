# Physics calculations
## Premise
In this simulation, the shooter stays fixed at the origin, such that the world moves relative to it (just like in Minecraft).

Let the values in the menu be:
$t$ denote target position derivatives
$s$ denote shooter position derivatives
$\Delta sp$ denote projectile displacement derivatives on top of shooter position derivatives (Note: we consider that the vector in the objective function, in our case the velocity vector, is zero in this array)

Note that $\Delta sp$ is already shifted so that the projectile movement uses these vectors for calculations
And target will use $\Delta st$ = $t - s$

Now we will store inside the global components the pre-scaled version of the position derivatives based on its index in the Taylor polynomial. This means that every vector should be scaled by $1/k!$ where $k$ is its order, which is encoded by its position in the array.

### Backend scaled movement vectors to store

Therefore for the movement we store
$$\text{scaledTargetDerivatives}[i] = \frac{1}{i!} \Delta st[i] = \frac{1}{i!} (t - s)$$ 
$$\text{scaledProjectileDerivatives}[i] = \frac{1}{i!} \Delta sp[i]$$

## Calculation of the projectile initial velocity vector to minimize the object function

Now for the calculation of the initial velocity vector that minimizes our loss (objective) function, which is $$\frac{\| {\Delta pt}(T)\|^2}{T^2}=\frac{\Delta pt(T) \cdot \Delta pt(T)}{T^2}$$ where $T$ is the time of intersection between the target and projectile and as always $\Delta pt = t - p$.

As in the description of the solution in my CrazyBallistics repository we have
$$s_p^{(k)}(T)=\frac{\Delta s_{pt}(T)}{T^k}$$ where $\Delta s_{pt}(T)$ is everything else that got isolated to the other side, so $\Delta s_{pt}[i]:=(\text{scaledTargetDerivatives} - \text{scaledProjectileDerivatives})[i]$ except for $\Delta s_{pt}[k]:=\text{scaledTargetDerivatives}[k]$. The function version of the array is simply the Taylor polynomial evaluation.

Except that for computation, it is much cheaper to work with scalars compared to vectors. So representing $s(T) \cdot s(T)$ explicitly as a scalar-coefficient Laurent polynomial is better: this is done through a convolution of the 2 arrays to add every term of the same degree together.

Then, to minimize the function, we take the derivative of the Laurent polynomial and set it to 0. To find the roots we shift the degree so that the exponents are all nonnegative, so we can find its zeroes like a regular polynomial.