# Authorship

- In Pondlife, agents and other user-created simulation objects have an Author. This is the user who has created the object and hence has provenance of authorship for it.
- Authorship of an object is declared in the AuthorId field of the base object. This ID corresponds to an ID of a user object in the user database.
- Simulation objects are stored in a non-relational database as they are typically nested key-value objects of varying schemas defined by each user. Whereas user data is stored in a relational database as it conforms more obviously to a relational database use case along with the other plumbing of a CRUD-based web application.
- Separating simulation data from user and other website data may potentially also support easier ringfencing of simulation objects for use in other mediums (needs further scoping/investigation).
- Agents and other Pondlife simulation objects are conceived of as being shareable: a modular, open source format that could be deployed to one of many servers, in the same way that git is open source and a user can define various remote origins, (github.com, gitlab.com etc), not just a centralised host
- If so, this means the current/initial relational database user ID approach may not be sufficient. One alternative would be a blockchain-based approach, where authorship details are stored on a blockchain. But that is a question for a later stage of development.

# Cloning and Chains of Authorship (and Provenance)

- In Pondlife, simulations are intended to be open to scrutiny and replication. Hence they are collaborative in nature, and the objects comprising the simulation are intended to be shared, copied and edited. A user may create a simulation modelling how humans might behave under certain conditions; another user might disagree and clone the simulation and its agents, edit the agent properties and propose this as a more credible model of real life.
- The author of a sim object can set this object as cloneable or not. Note: preventing replication of sim objects might not be straightforward or even possible in an open source platform where objects exist as browser client Javascript objects.
- If the object is set as cloneable, the Pondlife UI will allow the user to create a copy of the object. The user who clones the object has authorship of the object, but the cloned object has a field specifying which parent object it was cloned from. Note: there is nothing to stop a user recreating an identical object from scratch as the original object instead of cloning it, allowing them to claim authorship of the original object shape, rather than having copied another's work. That will require some thought regarding implications and options.
- The user can then edit this cloned object to modify it from the original as intended.
- It is envisaged that there will be chains of authorship, which will be displayable in the Pondlife UI. A model can be created by an initial author, and edited by another user, and their version can be edited by other users and so on.

# Agents and Other Sim Objects in the Pondlife UI

- A user can search for simulations, agents and other sim objects (actions, conditions, utility functions etc) in the Pondlife UI. They can search by author, or other attributes such as subject tags.
- These tags will live as metadata on the sim object. They can be defined by the user, and perhaps other users will be able to additionally assign tags to sim objects, which will allow the crowdsourcing of helpful categorisation.
- The Pondlife UI shows authorship, subject matter, a sprite preview, date created and other details in a search and browsing interface.

# Endorsing Sim Objects

- A Pondlife sim object can be "endorsed" by other users. This is a way of users to increase visibility for models and model data that they find to be useful. For example, a model of how a business might act in certain circmustances can be endorsed, as can the individual decision-making logic, if users consider this useful.
- This "endorsement" state (which may eventually get a different name) is similar to a Facebook or Twitter "like" or a Reddit "upvote", essentially a vote of confidence stored in a database (or potentially blockchain).
- Given that a simulation model contains many moving parts, and that all of the logical premises which comprise it are not immediately visible, the provenance and social backing of a model will provide an important layer in helping both casual and power users to make quick initial assessment about what they are viewing on the screen.